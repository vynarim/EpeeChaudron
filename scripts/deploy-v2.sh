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

set -euo pipefail

HOST="[hôte SFTP retiré]"
USER="LOGIN_SFTP"
REMOTE_DIR="www/v2"
DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

cd "$(dirname "$0")/.."

# --- Fichiers à envoyer ------------------------------------------------------
# index.html + tout assets/. Rien d'autre : ni *.md, ni scripts/, ni package*.
mapfile -t FILES < <(
  printf 'index.html\n'
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

# Échappement pour le fichier de configuration curl (chaîne entre guillemets).
ESC_PASS="$(printf '%s' "$PASS" | sed -e 's/\/\\/g' -e 's/"/\\"/g')"

curl_conf() {
  printf 'user = "%s:%s"\n' "$USER" "$ESC_PASS"
  printf 'silent\nshow-error\nfail\nftp-create-dirs\ninsecure\n'
}

# --- Envoi -------------------------------------------------------------------
# Une seule invocation curl : la connexion SFTP est réutilisée pour tous les
# fichiers, y compris le .htaccess et le .htpasswd de protection.
ARGS=()
for f in "${FILES[@]}"; do
  ARGS+=( --upload-file "$f" "sftp://$HOST/$REMOTE_DIR/$f" )
done
ARGS+=( --upload-file "deploy/v2.htaccess" "sftp://$HOST/$REMOTE_DIR/.htaccess" )
[ -f "deploy/v2.htpasswd" ] && ARGS+=( --upload-file "deploy/v2.htpasswd" "sftp://$HOST/$REMOTE_DIR/.htpasswd" )

curl_conf | curl -K - "${ARGS[@]}"

echo "Envoyé dans $REMOTE_DIR/ sur $HOST."
echo "À vérifier : https://epee-chaudron.fr/v2/"
