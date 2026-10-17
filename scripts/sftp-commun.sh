# Accès SFTP à l'hébergement OVH, partagé par deploy.sh et verif-serveur.sh.
# À charger avec « source », depuis la racine du dépôt.
#
# Le mot de passe n'est jamais écrit dans une ligne de commande : il est lu
# depuis la variable OVH_SFTP_PASSWORD, ou depuis le fichier désigné par
# OVH_SFTP_PASSWORD_FILE (par défaut ~/.epeechaudron-sftp), et transmis à curl
# par son entrée standard.
#
# L'hôte et le login ne sont pas dans le dépôt, qui est public : ils sont lus
# dans deploy/acces-sftp.local (ignoré par git, deux lignes HOST=… et USER=…),
# ou dans les variables OVH_SFTP_HOST et OVH_SFTP_USER.

ACCES="deploy/acces-sftp.local"
HOST="${OVH_SFTP_HOST:-}"
USER="${OVH_SFTP_USER:-}"
if [ -z "$HOST" ] || [ -z "$USER" ]; then
  if [ ! -f "$ACCES" ]; then
    echo "Accès SFTP introuvable : ni OVH_SFTP_HOST/OVH_SFTP_USER, ni $ACCES" >&2
    exit 1
  fi
  HOST="${HOST:-$(sed -n 's/^HOST=//p' "$ACCES" | tr -d '')}"
  USER="${USER:-$(sed -n 's/^USER=//p' "$ACCES" | tr -d '')}"
fi
REMOTE_DIR="/home/$USER/www"

# Ce qui est en ligne d'après le dernier envoi : taille, empreinte SHA-256 et
# chemin de chaque fichier. Écrit par deploy.sh, relu par verif-serveur.sh.
ETAT="deploy/etat-en-ligne.txt"

charger_mot_de_passe() {
  PASS="${OVH_SFTP_PASSWORD:-}"
  if [ -z "$PASS" ]; then
    local fichier="${OVH_SFTP_PASSWORD_FILE:-$HOME/.epeechaudron-sftp}"
    if [ ! -f "$fichier" ]; then
      echo "Mot de passe introuvable : ni OVH_SFTP_PASSWORD, ni $fichier" >&2
      exit 1
    fi
    PASS="$(head -1 "$fichier" | tr -d '\r\n')"
  fi
}

curl_conf() {
  # Valeur NON entre guillemets : curl la prend telle quelle jusqu'au saut de
  # ligne, donc aucun caractère du mot de passe n'a besoin d'être échappé.
  printf 'user = %s:%s\n' "$USER" "$PASS"
  printf 'silent\nshow-error\nfail\nftp-create-dirs\n'
}

# Contenu d'un dossier distant, une ligne par entrée : « type<TAB>taille<TAB>nom ».
# type vaut d (dossier) ou - (fichier). Les noms peuvent contenir des espaces.
# $1 = chemin du dossier, relatif à REMOTE_DIR, avec / final (vide = racine).
lister_distant() {
  local essai brut
  for essai in 1 2 3; do
    if brut="$(curl_conf | curl -K - "sftp://$HOST$REMOTE_DIR/$1" 2>/dev/null)"; then
      printf '%s\n' "$brut" | awk '
        NF >= 9 {
          t = substr($1, 1, 1); taille = $5
          sub(/^([^ ]+ +)(([^ ]+) +){7}/, "")
          if ($0 != "." && $0 != "..") print t "\t" taille "\t" $0
        }'
      return 0
    fi
    sleep 3   # OVH refuse parfois une connexion trop rapprochée de la précédente
  done
  echo "Impossible de lister $REMOTE_DIR/$1" >&2
  return 1
}

# Taille et empreinte d'un fichier local, au format de ETAT.
empreinte() {   # $1 = fichier local, $2 = chemin en ligne
  printf '%s\t%s\t%s\n' "$(stat -c %s "$1")" "$(sha256sum "$1" | cut -d' ' -f1)" "$2"
}
