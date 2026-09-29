#!/usr/bin/env bash
# Contrôle de ce qui est réellement en ligne, sans rien modifier sur le serveur.
#
# Compare le serveur à deploy/etat-en-ligne.txt, écrit par le dernier envoi, et
# signale :
#   EN TROP   un fichier que l'envoi n'a pas déposé — une page ajoutée par un
#             pirate, comme le diff.html trouvé sur l'ancien site ;
#   MODIFIÉ   un fichier dont la taille (ou, avec --complet, le contenu) a
#             changé depuis l'envoi ;
#   MANQUANT  un fichier envoyé qui a disparu.
#
#   bash scripts/verif-serveur.sh             # tailles seules, rapide
#   bash scripts/verif-serveur.sh --complet   # télécharge tout, compare les empreintes
#
# Code de sortie 1 s'il y a une anomalie. deploy.sh le lance avant chaque
# envoi : un envoi en miroir effacerait la preuve.
#
# www/supprimer/ est ignoré : il attend d'être effacé à la main et n'est jamais
# servi (voir deploy/prod.htaccess).

set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/sftp-commun.sh

COMPLET=0
[ "${1:-}" = "--complet" ] && COMPLET=1

if [ ! -f "$ETAT" ]; then
  echo "$ETAT absent : aucun envoi de référence. Lancer d'abord scripts/deploy.sh." >&2
  exit 1
fi
charger_mot_de_passe

declare -A TAILLE HASH VU
while IFS=$'\t' read -r taille hash chemin; do
  TAILLE["$chemin"]="$taille"
  HASH["$chemin"]="$hash"
done < "$ETAT"

ANOMALIES=0
signaler() { echo "  $1 : $2"; ANOMALIES=$((ANOMALIES + 1)); }

parcourir() {   # $1 = dossier relatif, avec / final
  local type taille nom liste
  liste="$(lister_distant "$1")"
  while IFS=$'\t' read -r type taille nom; do
    [ -z "$nom" ] && continue
    if [ "$type" = d ]; then
      [ "$1$nom" = "supprimer" ] && continue
      parcourir "$1$nom/"
    elif [ -z "${TAILLE[$1$nom]+x}" ]; then
      signaler "EN TROP " "$1$nom ($taille octets)"
    else
      VU["$1$nom"]=1
      if [ "$taille" != "${TAILLE[$1$nom]}" ]; then
        signaler "MODIFIÉ " "$1$nom (${TAILLE[$1$nom]} → $taille octets)"
      fi
    fi
  done <<< "$liste"
}
parcourir ""

for chemin in "${!TAILLE[@]}"; do
  [ -z "${VU[$chemin]+x}" ] && signaler "MANQUANT" "$chemin"
done

if [ "$COMPLET" = "1" ]; then
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  # curl est un programme Windows sous Git Bash : il lui faut C:/…, pas /tmp/…
  SORTIE="$(cygpath -m "$TMP" 2>/dev/null || echo "$TMP")"
  {
    curl_conf
    for chemin in "${!VU[@]}"; do
      printf 'url = "sftp://%s%s/%s"\noutput = "%s/%s"\n' "$HOST" "$REMOTE_DIR" "$chemin" "$SORTIE" "$chemin"
    done
  } | curl -K - --create-dirs || true
  for chemin in "${!VU[@]}"; do
    if [ ! -f "$TMP/$chemin" ]; then
      signaler "ILLISIBLE" "$chemin (téléchargement impossible)"
    elif [ "$(sha256sum "$TMP/$chemin" | cut -d' ' -f1)" != "${HASH[$chemin]}" ]; then
      signaler "MODIFIÉ " "$chemin (contenu différent)"
    fi
  done
fi

if [ "$ANOMALIES" -gt 0 ]; then
  echo "$ANOMALIES anomalie(s) sur le serveur par rapport au dernier envoi."
  exit 1
fi
MODE="tailles comparées"
[ "$COMPLET" = "1" ] && MODE="contenus comparés"
echo "Serveur conforme au dernier envoi : ${#TAILLE[@]} fichiers, $MODE."
