#!/usr/bin/env bash
# Mise en ligne du site à la racine www/ de l'hébergement OVH, c'est-à-dire
# sur https://epee-chaudron.fr/. Il n'y a plus de recette : depuis la bascule
# du 29/09/2026, chaque envoi part directement chez les visiteurs.
#
# Le mot de passe SFTP n'est jamais écrit dans la ligne de commande : il est lu
# depuis la variable OVH_SFTP_PASSWORD, ou depuis le fichier désigné par
# OVH_SFTP_PASSWORD_FILE (par défaut ~/.epeechaudron-sftp), et transmis à curl
# par son entrée standard.
#
#   OVH_SFTP_PASSWORD='...' bash scripts/deploy.sh
#   bash scripts/deploy.sh            # lit ~/.epeechaudron-sftp
#   bash scripts/deploy.sh --dry-run  # liste ce qui partirait, sans rien envoyer
#
# L'envoi est un miroir : les fichiers présents sur le serveur et absents en
# local sont retirés. Voir « Nettoyage » plus bas.

set -euo pipefail

HOST="[hôte SFTP retiré]"
USER="LOGIN_SFTP"
REMOTE_DIR="/home/LOGIN_SFTP/www"
DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

cd "$(dirname "$0")/.."

# --- Fichiers à envoyer ------------------------------------------------------
# index.html, le manifeste, le service worker, robots.txt, le fichier de
# validation de Google Search Console et tout assets/.
# Rien d'autre : ni *.md, ni scripts/, ni package*.
#
# Le fichier google*.html prouve à Google que le domaine nous appartient. Le
# retirer du serveur ferait perdre l'accès à la Search Console.
#
# Exception : les JPEG de assets/img/personnages/ sont les photos d'origine
# fournies par l'association, converties en WebP puis effacées. Elles n'ont
# rien a faire en ligne — l'une d'elles pesait 12 Mo a elle seule. Les JPEG
# des autres dossiers partent normalement : les captures d'ecran declarees
# dans le manifeste en sont.
mapfile -t FILES < <(
  printf 'index.html\nmanifest.webmanifest\nsw.js\nrobots.txt\n'
  ls google*.html
  find assets -type f ! -name '.*' \
    | grep -viE '^assets/img/personnages/.*\.(jpg|jpeg)$' \
    | sort
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
# fichiers, y compris le .htaccess et le service worker qui désinscrit
# l'ancienne recette /v2/ (voir l'en-tête de deploy/v2-sw.js).
ARGS=()
for f in "${FILES[@]}"; do
  ARGS+=( --upload-file "$f" "sftp://$HOST/$REMOTE_DIR/$f" )
done
ARGS+=( --upload-file "deploy/prod.htaccess" "sftp://$HOST/$REMOTE_DIR/.htaccess" )
ARGS+=( --upload-file "deploy/v2-sw.js" "sftp://$HOST/$REMOTE_DIR/v2/sw.js" )

curl_conf | curl -K - "${ARGS[@]}"

# --- Nettoyage : ce qui n'existe plus en local part du serveur ---------------
# Ce script est seul à écrire sur l'hébergement. Un fichier présent
# là-haut mais absent de la liste locale est le reliquat d'un envoi précédent :
# le portrait d'un membre qui a quitté la compagnie, un JPEG déjà converti en
# WebP. Sans ce passage il resterait servi indéfiniment — un envoi n'ajoutait
# que des fichiers, il n'en retirait aucun.
# Les fichiers cachés sont volontairement épargnés : le .htaccess est déposé à
# part et ne figure pas dans FILES. Un sous-dossier n'est parcouru que s'il
# contient un fichier du site : v2/ n'est donc jamais vidé par ce passage.

lister_distant() {   # $1 = chemin du dossier, relatif à REMOTE_DIR, avec / final
  curl_conf | curl -K - "sftp://$HOST/$REMOTE_DIR/$1" 2>/dev/null \
    | awk '$1 !~ /^d/' | sed -E 's/^([^ ]+ +){8}//' | grep -v '^\.' || true
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
    SUPPR+=( -Q "rm \"$REMOTE_DIR/$r\"" )
  done
  curl_conf | curl -K - "${SUPPR[@]}" "sftp://$HOST/$REMOTE_DIR/" -o /dev/null
  echo "${#RELIQUATS[@]} fichier(s) obsolète(s) retiré(s) du serveur."
fi

echo "Envoyé dans $REMOTE_DIR/ sur $HOST."
echo "À vérifier : https://epee-chaudron.fr/"
