#!/usr/bin/env bash
# Envoi du site dans le répertoire de recette www/v2/ sur l'hébergement OVH.
# Le site en production (www/index.html, www/assets/...) n'est jamais touché.
#
# Le mot de passe SFTP n'est jamais écrit dans la ligne de commande : il est lu
# depuis la variable OVH_SFTP_PASSWORD, ou depuis le fichier désigné par
# OVH_SFTP_PASSWORD_FILE (par défaut ~/.epeechaudron-sftp), et transmis à curl
# par son entrée standard.
#
#   OVH_SFTP_PASSWORD='...' bash scripts/deploy-v2.sh
#   bash scripts/deploy-v2.sh            # lit ~/.epeechaudron-sftp
#   bash scripts/deploy-v2.sh --dry-run  # liste ce qui partirait, sans rien envoyer
#
# L'envoi est un miroir : les fichiers présents sur le serveur et absents en
# local sont retirés. Voir « Nettoyage » plus bas.

set -euo pipefail

HOST="[hôte SFTP retiré]"
USER="LOGIN_SFTP"
REMOTE_DIR="/home/LOGIN_SFTP/www/v2"
DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

cd "$(dirname "$0")/.."

# --- Fichiers à envoyer ------------------------------------------------------
# index.html, le manifeste, le service worker et tout assets/. Rien d'autre : ni *.md, ni scripts/, ni package*.
mapfile -t FILES < <(
  printf 'index.html\nmanifest.webmanifest\nsw.js\n'
  find assets -type f ! -name '.*' | sort
)

echo "${#FILES[@]} fichiers, $(du -ch index.html assets 2>/dev/null | tail -1 | cut -f1) au total."

if [ "$DRY_RUN" = "1" ]; then
  printf '%s\n' "${FILES[@]}"
  echo "(--dry-run : rien n'a été envoyé)"
  exit 0
fi

# --- Mot de passe ------------------------------------------------------------
PASS="${OVH_SFTP_PASSWORD:-}"
if [ -z "$PASS" ]; then
  PASS_FILE="${OVH_SFTP_PASSWORD_FILE:-$HOME/.epeechaudron-sftp}"
  if [ ! -f "$PASS_FILE" ]; then
    echo "Mot de passe introuvable : ni OVH_SFTP_PASSWORD, ni $PASS_FILE" >&2
    exit 1
  fi
  PASS="$(head -1 "$PASS_FILE" | tr -d '\r\n')"
fi

curl_conf() {
  # Valeur NON entre guillemets : curl la prend telle quelle jusqu'au saut de
  # ligne, donc aucun caractère du mot de passe n'a besoin d'être échappé.
  printf 'user = %s:%s
' "$USER" "$PASS"
  printf 'silent
show-error
fail
ftp-create-dirs
'
}

# --- Envoi -------------------------------------------------------------------
# Une seule invocation curl : la connexion SFTP est réutilisée pour tous les
# fichiers, y compris le .htaccess et le .htpasswd de protection.
ARGS=()
for f in "${FILES[@]}"; do
  ARGS+=( --upload-file "$f" "sftp://$HOST/$REMOTE_DIR/$f" )
done
ARGS+=( --upload-file "deploy/v2.htaccess" "sftp://$HOST/$REMOTE_DIR/.htaccess" )
if [ -f "deploy/v2.htpasswd" ]; then
  ARGS+=( --upload-file "deploy/v2.htpasswd" "sftp://$HOST/$REMOTE_DIR/.htpasswd" )
else
  echo "deploy/v2.htpasswd absent : le repertoire ne serait pas protege." >&2
  exit 1
fi

curl_conf | curl -K - "${ARGS[@]}"

# --- Nettoyage : ce qui n'existe plus en local part du serveur ---------------
# Ce script est seul à écrire dans le répertoire de recette. Un fichier présent
# là-haut mais absent de la liste locale est le reliquat d'un envoi précédent :
# le portrait d'un membre qui a quitté la compagnie, un JPEG déjà converti en
# WebP. Sans ce passage il resterait servi indéfiniment — un envoi n'ajoutait
# que des fichiers, il n'en retirait aucun.
# Les fichiers cachés sont volontairement épargnés : .htaccess et .htpasswd
# sont déposés à part et ne figurent pas dans FILES.

lister_distant() {   # $1 = chemin du dossier, relatif à REMOTE_DIR, avec / final
  curl_conf | curl -K - "sftp://$HOST/$REMOTE_DIR/$1" 2>/dev/null \
    | awk '$1 !~ /^d/ { print $NF }' | grep -v '^\.' || true
}

mapfile -t DOSSIERS < <(printf '%s\n' "${FILES[@]}" | sed 's#/[^/]*$##; s#^[^/]*$#.#' | sort -u)

RELIQUATS=()
for d in "${DOSSIERS[@]}"; do
  prefixe=""
  [ "$d" != "." ] && prefixe="$d/"
  while IFS= read -r nom; do
    [ -z "$nom" ] && continue
    chemin="$prefixe$nom"
    if ! printf '%s\n' "${FILES[@]}" | grep -qxF "$chemin"; then
      RELIQUATS+=( "$chemin" )
    fi
  done < <(lister_distant "$prefixe")
done

if [ ${#RELIQUATS[@]} -gt 0 ]; then
  SUPPR=()
  for r in "${RELIQUATS[@]}"; do
    echo "  retiré du serveur : $r"
    SUPPR+=( -Q "rm $REMOTE_DIR/$r" )
  done
  curl_conf | curl -K - "${SUPPR[@]}" "sftp://$HOST/$REMOTE_DIR/" -o /dev/null
  echo "${#RELIQUATS[@]} fichier(s) obsolète(s) retiré(s) du serveur."
fi

echo "Envoyé dans $REMOTE_DIR/ sur $HOST."
echo "À vérifier : https://epee-chaudron.fr/v2/"
