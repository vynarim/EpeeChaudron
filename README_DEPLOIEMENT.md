# Déploiement du site L'Épée et le Chaudron

Le site est statique : aucun serveur applicatif, aucune base de données, aucune
compilation. Mettre en ligne = copier les fichiers sur l'hébergement.

## 1. Hébergement

> Ne jamais écrire de mot de passe ici : ce fichier est dans le dépôt git
> (privé aujourd'hui — retirer les identifiants s'il devient public).

| Élément | Valeur |
| --- | --- |
| Hébergeur | OVH — hébergement web mutualisé, offre **Free hosting** (100 Mo d'espace disque, le site en occupe ~7 Mo), datacentre `eu-west-gra`, cluster `[cluster retiré]` |
| Compte client OVH | identifiant `[identifiant OVH retiré]` (titulaire : [titulaire]) — https://www.ovh.com/manager/ |
| Nom de domaine | `epee-chaudron.fr`, enregistré chez OVH le 4 nov. 2013, expire le 4 nov. 2027 |
| Renouvellement | hébergement : automatique (prévu nov. 2027). Domaine : la fiche du domaine affiche **« Fréquence de renouvellement : aucune »** — à activer, ou renouveler à la main avant le 4 nov. 2027 |
| Serveurs DNS | `ns106.ovh.net` / `dns106.ovh.net` — zone gérée chez OVH |
| Adresse du serveur web | IPv4 `[IP retirée]`, IPv6 `[IP retirée]` |
| Accès aux fichiers | hôte `[hôte SFTP retiré]` — SFTP port 22 (activé) ou FTP port 21 — login `LOGIN_SFTP`, répertoire home `/home/LOGIN_SFTP` |
| Dossier racine du site | `www/` (site « Website-www », domaines associés : `epee-chaudron.fr`, `www.epee-chaudron.fr`, `[adresse technique retirée]`) |
| Où sont conservés les mots de passe | _(à compléter : gestionnaire de mots de passe de …)_ |
| Certificat HTTPS | Let's Encrypt actif sur `epee-chaudron.fr` et `www.epee-chaudron.fr` (émis le 15/11/2025, renouvelé automatiquement par OVH) |
| Adresse mail de contact | `contact@epee-chaudron.fr` — adresses e-mail OVH incluses dans l'offre (actives) |
| Dépôt de code | https://github.com/vynarim/EpeeChaudron (privé) — branche `main` |
| Personne référente | [titulaire], titulaire du domaine et de l'hébergement |

## 2. Contenu du dossier à envoyer

```text
index.html                 page unique du site
manifest.webmanifest       description de l'application installable
sw.js                      service worker (consultation hors ligne)
assets/css/style.css       styles (charte, responsive, carrousels)
assets/js/main.js          menu, fiches animations, liste de souhaits, carrousels, lightbox, onglets
assets/js/photos.js        liste des photos de la galerie
assets/js/personnages.js   liste des personnages (portrait, nom, rôle, accroche)
assets/img/full/           photos grand format (hero, bande, lightbox)
assets/img/thumbs/         miniatures 720×520 (cartes animations, galerie)
assets/img/personnages/    portraits des personnages (format 3/4)
assets/img/icons/          icônes d'application, icône iOS, favicon, captures
assets/img/logo-square.webp
```

**Ne pas envoyer** : `node_modules/`, `.playwright-mcp/`, `.git/`, `.vscode/`,
`.claude/`, `.codex/`, `.impeccable/`, `scripts/`, `package*.json` et les fichiers
`*.md`. Ils ne servent qu'au développement.

## 3. Mettre en ligne

1. En local, ouvrir `index.html` (ou `npm run dev`) et vérifier que tout
   s'affiche : la page, une photo en plein écran, une fiche animation.
2. Lancer `npm run check` : il doit répondre « Vérification OK ».
3. Se connecter en SFTP à `[hôte SFTP retiré]` (port 22, login `LOGIN_SFTP`,
   par exemple avec FileZilla ou WinSCP) et envoyer `index.html` et le dossier
   `assets/` dans `www/`, en **écrasant** les fichiers existants.
   Les images retirées du dépôt peuvent rester sur le serveur sans gêner.
4. Ouvrir https://epee-chaudron.fr/ dans une fenêtre de navigation privée
   (pour ne pas voir l'ancienne version en cache) et refaire les trois
   vérifications de l'étape 1, sur téléphone puis sur ordinateur.

## 3 bis. Le répertoire de recette `/v2/`

Le nouveau site est en ligne dans `www/v2/` pendant que l'ancien continue de
tourner à la racine. Il sert aux membres de l'association à relire et tester
avant la bascule.

| Élément | Valeur |
| --- | --- |
| Adresse | https://epee-chaudron.fr/v2/ |
| Identifiant | `gras` |
| Mot de passe | _(à conserver dans le gestionnaire de mots de passe — il n'est écrit nulle part dans le dépôt)_ |
| Répertoire serveur | `/home/LOGIN_SFTP/www/v2/` |
| Protection | `.htaccess` local au répertoire : mot de passe, `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`, `Cache-Control: no-cache` |

Ce `.htaccess` ne concerne que `v2/`. **Rien à la racine n'est modifié** — ni
`www/index.html`, ni `www/.htaccess`, ni `www/robots.txt`. Volontairement, le
chemin `/v2/` n'est pas déclaré dans `robots.txt` : ce serait publier l'adresse
dans un fichier que tout le monde peut lire. Le mot de passe suffit — un robot
reçoit un 401 et ne voit jamais la page.

### Renvoyer une nouvelle version dans `/v2/`

1. Écrire le mot de passe SFTP du compte `LOGIN_SFTP` sur une seule ligne dans
   `%USERPROFILE%\.epeechaudron-sftp` — **hors du dépôt**, donc impossible à
   committer par accident. (Ou renseigner la variable `OVH_SFTP_PASSWORD`.)
2. Lancer :

```bash
bash scripts/deploy-v2.sh --dry-run   # liste les fichiers, n'envoie rien
bash scripts/deploy-v2.sh             # envoie index.html, assets/ et la protection
```

Le script n'envoie que `index.html`, `assets/` et les deux fichiers de
protection : ni `*.md`, ni `scripts/`, ni `package*.json`. Le mot de passe est
transmis à `curl` par son entrée standard : il n'apparaît dans aucune ligne de
commande ni dans la liste des processus.

Le fichier `deploy/v2.htpasswd` contient l'identifiant des membres et son mot de
passe chiffré. Il est exclu du dépôt par `.gitignore`. S'il est perdu, le
regénérer :

```bash
openssl passwd -apr1 "<nouveau mot de passe>"   # coller le résultat après "gras:"
```

### Empreintes du serveur SFTP

À comparer en cas d'avertissement du client SFTP (relevées le 22/09/2026) :

```text
RSA      SHA256:nsRZDOCdKhAyoO2SBgB1OZkJiuk2ofnTIPdNSERXnYQ
ED25519  SHA256:FqKUcYORjRzc15jHhIGKwTq+sTUo+6rkTINHcJA2mdg
```

### Le jour de la bascule

Copier le contenu de `www/v2/` à la racine de `www/` — **sans** les fichiers
`.htaccess` et `.htpasswd` de recette, qui mettraient un mot de passe et un
`noindex` sur le site public — puis supprimer le répertoire `v2/`.

Une ligne du `.htaccess` de recette doit malgré tout être reportée dans le
`.htaccess` de la racine, sans quoi le manifeste peut être refusé par certains
navigateurs :

```apache
AddType application/manifest+json .webmanifest
```

Et, tant qu'à faire, celle qui empêche le service worker de rester figé :

```apache
<Files "sw.js">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
</Files>
```

Penser aussi à **désinscrire le service worker de `/v2/`** chez les membres qui
avaient installé la recette : ouvrir `https://epee-chaudron.fr/v2/` une
dernière fois n'y suffit pas. Le plus simple est de leur faire supprimer
l'application installée puis de réinstaller depuis la nouvelle adresse.

## 3 ter. L'application installable

Le site se déclare comme une application : un téléphone propose de l'ajouter à
l'écran d'accueil, et il reste consultable sans réseau. Trois fichiers en sont
responsables — `manifest.webmanifest`, `sw.js` et le dossier
`assets/img/icons/` — et ils doivent partir ensemble. `scripts/deploy-v2.sh`
s'en charge ; un envoi manuel ne doit pas les oublier.

Le service worker travaille en **réseau d'abord** : la version en ligne gagne
toujours. Remplacer une photo par un fichier du même nom fonctionne donc sans
précaution particulière. Un visiteur qui a l'application ouverte verra la
nouvelle version au rechargement suivant.

### Le manifeste et le mot de passe de la recette

Le manifeste est déclaré dans `index.html` avec `crossorigin="use-credentials"`.
Sans cet attribut, le navigateur demande le manifeste **sans identifiants** :
le répertoire de recette lui répond 401, et Chrome affiche « Impossible
d'installer cette appli ». L'attribut est sans effet une fois le site à la
racine, sans mot de passe — le laisser. `npm run check` refuse de passer s'il
disparaît.

### Refabriquer les icônes

Toutes les icônes sont découpées dans la photo de bannière
`assets/img/favicon.png` (512 × 512), avec **deux découpes différentes** :

- **la bannière entière**, sur le carré de tissu seul (x 22 → 478, y 4 → 460),
  pour les icônes d'application. À 180 px et au-delà, le nom brodé en haut de
  la bannière est lisible : il a sa place.
- **l'emblème seul**, resserré sous le bandeau de texte (x 60 → 430,
  y 90 → 460), pour le favicon. À 16 px le bandeau ne fait qu'une bavure grise
  et vole un sixième de la surface ; sans lui, l'épée, le chaudron et la
  diagonale bleu-or restent identifiables.

| Fichier | Taille | Découpe |
| --- | --- | --- |
| `icon-192.png` | 192 | bannière entière |
| `icon-512.png` | 512 | bannière entière |
| `icon-maskable-192.png` | 192 | bannière entière à 72 % sur fond bleu `#123d91` |
| `icon-maskable-512.png` | 512 | idem |
| `apple-touch-icon.png` | 180 | bannière entière (écran d'accueil iOS) |
| `favicon-16.png` | 16 | emblème seul (onglet du navigateur) |
| `favicon-32.png` | 32 | emblème seul |
| `favicon-48.png` | 48 | emblème seul |
| `favicon-96.png` | 96 | emblème seul (favoris, écrans haute densité) |

Les deux icônes « maskable » gardent une marge : Android découpe l'icône en
rond ou en carré arrondi selon le téléphone, et mange les bords.

L'onglet du navigateur ne charge plus que **805 octets** (`favicon-16.png`), au
lieu des 359 Ko de la photo de bannière servie telle quelle auparavant.

Les deux captures `capture-mobile.jpg` (390 × 844) et `capture-desktop.jpg`
(1280 × 800) s'affichent dans la fenêtre d'installation de Chrome. Les refaire
après une refonte visuelle, sinon elles montreront l'ancien site.

`npm run check` vérifie que le manifeste est lisible, qu'il a ses champs
obligatoires, ses icônes 192 et 512, au moins une icône « maskable », et que
chaque image qu'il déclare existe vraiment.

## 4. Mettre à jour le contenu

### Ajouter une photo à la galerie

1. Préparer deux fichiers WebP : la photo grand format dans `assets/img/full/`
   (1 600 px de large maximum) et sa miniature 720×520 dans
   `assets/img/thumbs/`, avec le même nom (`galerie-sujet.webp`).
2. Ajouter une ligne dans `assets/js/photos.js` :

```js
{
  src: 'assets/img/full/galerie-camp-exemple.webp',
  thumb: 'assets/img/thumbs/galerie-camp-exemple.webp',
  title: 'Titre court affiché sur la photo',
  category: 'Camp',
  alt: 'Description précise de la photo'
}
```

L'ordre du tableau est l'ordre du carrousel. La catégorie n'est plus affichée.

### Ajouter ou modifier un personnage

1. Déposer le portrait (photo verticale, format 3/4, environ 900×1200, WebP)
   dans `assets/img/personnages/`.
2. Ajouter ou modifier la ligne correspondante dans `assets/js/personnages.js` :

```js
{
  img: 'assets/img/personnages/personnages-exemple.webp',
  name: 'Nom affiché',
  role: 'Rôle affiché sous le nom',
  hook: 'Une phrase d’accroche, en italique sur la carte.',
  alt: 'Description de la photo'
}
```

Pour remplacer seulement la photo d'un personnage existant : écraser le fichier
du même nom, rien d'autre à changer. Les portraits actuels sont des reprises de
l'ancien site en basse définition, à remplacer dès que possible.

### Modifier une animation

Les animations sont dans `index.html`, section `#animations` : une carte
`article.module-card` par animation avec sa miniature, son titre, son résumé et,
dans `div.module-details`, le texte complet de la fiche.

### Modifier les textes

Tout le reste (hero, points forts, formats d'intervention, contact) est dans
`index.html`, en clair. L'adresse de contact apparaît deux fois : dans
`index.html` (bouton « Écrire à l'association ») et dans `assets/js/main.js`
(`recipient`, et le message d'erreur qui suit).

## 5. En cas de problème

- **La page est blanche ou sans style** : le dossier `assets/` n'est pas au
  même niveau que `index.html` sur le serveur.
- **Une image manque** : vérifier le nom exact du fichier (minuscules, accents
  interdits) et son chemin dans `photos.js` / `personnages.js`.
- **L'ancienne version s'affiche encore** : vider le cache ou ouvrir le site en
  navigation privée ; l'hébergeur peut aussi avoir un cache à purger.
- **Le bouton mail n'ouvre rien** : le texte du mail est copié dans le
  presse-papiers, l'utilisateur peut le coller dans sa messagerie ; le site
  l'indique.
