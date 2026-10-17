# Déploiement du site L'Épée et le Chaudron

Le site est statique : aucun serveur applicatif, aucune base de données, aucune
compilation. Mettre en ligne = copier les fichiers sur l'hébergement.

## 1. Hébergement

> Ce dépôt est public : n'écrire ici ni mot de passe, ni identifiant de
> compte, ni login SFTP. L'hôte et le login SFTP sont dans
> `deploy/acces-sftp.local` (ignoré par git), le mot de passe dans
> `%USERPROFILE%\.epeechaudron-sftp`.

| Élément | Valeur |
| --- | --- |
| Hébergeur | OVH — hébergement web mutualisé, offre **Free hosting** (100 Mo d'espace disque, le site en occupe ~7 Mo), datacentre `eu-west-gra` |
| Compte client OVH | identifiant connu du titulaire — https://www.ovh.com/manager/ |
| Nom de domaine | `epee-chaudron.fr`, enregistré chez OVH le 4 nov. 2013, expire le 4 nov. 2027 |
| Renouvellement | hébergement : automatique (prévu nov. 2027). Domaine : la fiche du domaine affiche **« Fréquence de renouvellement : aucune »** — à activer, ou renouveler à la main avant le 4 nov. 2027 |
| Serveurs DNS | `ns106.ovh.net` / `dns106.ovh.net` — zone gérée chez OVH |
| Accès aux fichiers | SFTP port 22 (activé) ou FTP port 21 — hôte et login dans `deploy/acces-sftp.local`, répertoire home `/home/<login>` |
| Dossier racine du site | `www/` (site « Website-www », domaines associés : `epee-chaudron.fr`, `www.epee-chaudron.fr`) |
| Où sont conservés les mots de passe | _(à compléter : gestionnaire de mots de passe de …)_ |
| Certificat HTTPS | Let's Encrypt actif sur `epee-chaudron.fr` et `www.epee-chaudron.fr` (émis le 15/11/2025, renouvelé automatiquement par OVH) |
| Adresse mail de contact | `contact@epee-chaudron.fr` — adresses e-mail OVH incluses dans l'offre (actives) |
| Dépôt de code | https://github.com/vynarim/EpeeChaudron (public) — branche `main` |
| Personne référente | le titulaire du domaine et de l'hébergement |

## 2. Contenu du dossier à envoyer

```text
index.html                 page unique du site
manifest.webmanifest       description de l'application installable
sw.js                      service worker (consultation hors ligne)
assets/css/style.css       styles (charte, responsive, carrousels)
assets/js/main.js          menu, fiches animations, liste de souhaits, carrousels, lightbox, onglets
assets/js/photos.js        liste des photos de la galerie
assets/js/ateliers.js      liste des ateliers (photo, titre, résumé, fiche complète)
assets/js/personnages.js   liste des personnages (portrait, nom, rôle, accroche, atelier)
assets/img/full/           photos grand format (hero, bande, lightbox)
assets/img/thumbs/         miniatures 720×520 de la galerie photo
assets/img/ateliers/       photos 720×520 des ateliers
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
3. Lancer `bash scripts/deploy.sh` (voir 3 bis). À défaut de script, se
   connecter en SFTP (port 22, hôte et login dans `deploy/acces-sftp.local`,
   par exemple avec FileZilla ou WinSCP) et envoyer dans `www/`
   `index.html`, `manifest.webmanifest`, `sw.js`, `robots.txt`, le fichier
   `google*.html` et le dossier `assets/`, plus `deploy/prod.htaccess` renommé
   en `.htaccess`, en **écrasant** les fichiers existants.
4. Ouvrir https://epee-chaudron.fr/ dans une fenêtre de navigation privée
   (pour ne pas voir l'ancienne version en cache) et refaire les trois
   vérifications de l'étape 1, sur téléphone puis sur ordinateur.

## 3 bis. Mise en ligne par script

Depuis le 29/09/2026, le site est servi à la racine : https://epee-chaudron.fr/.
Il n'y a plus de répertoire de recette ni de mot de passe — **chaque envoi part
directement chez les visiteurs**.

1. Écrire le mot de passe SFTP sur une seule ligne dans
   `%USERPROFILE%\.epeechaudron-sftp` — **hors du dépôt**, donc impossible à
   committer par accident. (Ou renseigner la variable `OVH_SFTP_PASSWORD`.)
   Écrire l'hôte et le login dans `deploy/acces-sftp.local`, ignoré par git :
   deux lignes `HOST=…` et `USER=…` (ou les variables `OVH_SFTP_HOST` et
   `OVH_SFTP_USER`).
2. Lancer :

```bash
npm run check                      # doit répondre « Vérification OK »
bash scripts/deploy.sh --dry-run   # liste les fichiers, n'envoie rien
bash scripts/deploy.sh             # envoie le site et le .htaccess
```

Le script envoie `index.html`, le manifeste, `sw.js`, `robots.txt`, le fichier
`google*.html` (validation de la Search Console — ne pas le supprimer) et
`assets/`, puis `deploy/prod.htaccess` sous le nom `www/.htaccess`. L'envoi est
un **miroir** : un fichier présent sur le serveur et absent en local, dans un
dossier du site, est retiré. Le mot de passe est transmis à `curl` par son
entrée standard : il n'apparaît dans aucune ligne de commande.

Le `.htaccess` de la racine :

- redirige `http://` vers `https://` ;
- renvoie les adresses de l'ancien site (`personnages.html`, `animations.html`,
  `contact.html`, `galerie/…`) vers la section correspondante de la page ;
- redirige `/v2/` vers la racine, sauf `v2/sw.js` (voir plus bas) ;
- sert le manifeste avec le bon type et interdit la mise en cache de `sw.js`.

### Sécurité

L'ancien site a été piraté : une page `diff.html`, déposée à la racine,
redirigeait vers un site de spam. Sans code côté serveur, la porte d'entrée
était presque sûrement le mot de passe FTP. D'où, par ordre d'importance :

1. **Les accès** (à tenir hors du dépôt) : mot de passe SFTP long et unique,
   FTP classique (port 21) coupé si l'offre le permet, double authentification
   sur le compte OVH, alertes e-mail de la Google Search Console actives.
2. **Le contrôle du serveur.** `npm run verif-serveur` compare ce qui est en
   ligne à `deploy/etat-en-ligne.txt`, écrit à chaque envoi, et signale tout
   fichier en trop, modifié ou manquant (`--complet` compare les contenus, pas
   seulement les tailles). `scripts/deploy.sh` le lance avant d'envoyer et
   **s'arrête** en cas d'anomalie, puisque l'envoi en miroir effacerait la
   preuve. Un dépôt légitime fait à la main : relancer avec `--force`.
3. **Le `.htaccess`** : aucun script serveur exécuté ni servi (PHP, CGI…), pas
   de liste des dossiers, et des consignes au navigateur — le site n'accepte
   que ses propres scripts et styles (Content-Security-Policy), ne s'affiche
   dans aucun cadre, et reste en HTTPS (HSTS, un an). Conséquence : **aucun
   script ni style écrit dans `index.html`**, tout passe par `assets/`.

### Empreintes du serveur SFTP

À comparer en cas d'avertissement du client SFTP (relevées le 22/09/2026) :

```text
RSA      SHA256:nsRZDOCdKhAyoO2SBgB1OZkJiuk2ofnTIPdNSERXnYQ
ED25519  SHA256:FqKUcYORjRzc15jHhIGKwTq+sTUo+6rkTINHcJA2mdg
```

### La bascule du 29/09/2026

L'ancien site (Artisteer, 2013) a été retiré de la racine ce jour-là. Une copie
complète a été téléchargée avant suppression, hors du dépôt, dans
`EpeeChaudron-ancien-site-2026-09-29/` à côté du dossier du projet. Elle
contenait une page piratée, `diff.html`, qui redirigeait vers un site de
spam : ne rien republier de cette copie sans l'avoir relue.

L'ancienne recette `/v2/` est redirigée vers la racine. Seul `v2/sw.js` y est
encore servi : c'est `deploy/v2-sw.js`, qui désinscrit le service worker de la
recette chez les membres qui l'avaient ouverte. Il pourra être retiré du
serveur, avec son exception dans le `.htaccess`, d'ici quelques mois. Les
membres qui avaient **installé** la recette comme application doivent la
supprimer et réinstaller depuis https://epee-chaudron.fr/.

## 3 ter. L'application installable

Le site se déclare comme une application : un téléphone propose de l'ajouter à
l'écran d'accueil, et il reste consultable sans réseau. Trois fichiers en sont
responsables — `manifest.webmanifest`, `sw.js` et le dossier
`assets/img/icons/` — et ils doivent partir ensemble. `scripts/deploy.sh`
s'en charge ; un envoi manuel ne doit pas les oublier.

Le service worker travaille en **réseau d'abord** : la version en ligne gagne
toujours. Remplacer une photo par un fichier du même nom fonctionne donc sans
précaution particulière. Un visiteur qui a l'application ouverte verra la
nouvelle version au rechargement suivant.

### Le manifeste et `crossorigin="use-credentials"`

Le manifeste est déclaré dans `index.html` avec `crossorigin="use-credentials"`.
L'attribut servait du temps de la recette protégée par mot de passe : sans lui,
le manifeste était refusé (401). Il est sans effet sur le site public — le
laisser. `npm run check` refuse de passer s'il disparaît.

### Refabriquer les icônes

Toutes les icônes sont découpées dans la photo de bannière
`assets/img/favicon.png` (512 × 512), sur **l'emblème seul** : le carré sous le
bandeau de texte, x 60 → 430, y 90 → 460. Elles sont éclaircies au passage
(`brightness(1.25) saturate(1.12) contrast(1.02)`) : la photo d'origine, prise à
l'intérieur, rendait un bleu terne une fois réduite.

Pourquoi l'emblème et pas la bannière entière, même en grand : **l'arrondi des
coins d'une icône n'est pas décidé par le site mais par le téléphone** — iOS
arrondit toujours, et sur Android c'est le lanceur qui impose sa forme, rond ou
carré arrondi. Posée en petit carré au milieu d'un fond bleu, la bannière
laissait voir ce fond comme un liseré qui soulignait l'arrondi ; pleine page,
elle se faisait couper son titre par le masque. L'emblème remplit toute la
forme et n'a rien d'important dans les coins. Le nom de l'association n'est pas
perdu pour autant : le téléphone l'écrit sous l'icône.

| Fichier | Taille | Usage |
| --- | --- | --- |
| `icon-192.png` | 192 | icône d'application, déclarée deux fois dans le manifeste (`any` et `maskable`) |
| `icon-512.png` | 512 | idem, et écran de démarrage Android |
| `apple-touch-icon.png` | 180 | écran d'accueil iOS |
| `favicon-16.png` | 16 | onglet du navigateur |
| `favicon-32.png` | 32 | onglet sur écran haute densité |
| `favicon-48.png` | 48 | raccourcis Windows |
| `favicon-96.png` | 96 | favoris, écrans haute densité |

Une même image sert aux usages `any` et `maskable` : comme elle remplit tout le
carré, rien ne la distingue plus d'une version « avec marge », et la dupliquer
ferait télécharger deux fois 500 Ko à l'installation.

L'onglet du navigateur charge **1 Ko** (`favicon-16.png`), contre 359 Ko quand la
photo de bannière servait telle quelle.

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

1. Déposer le portrait (format 3/4, 900×1200, WebP) dans
   `assets/img/personnages/`. À partir d'une photo quelconque, `npm run portrait`
   le recadre et le convertit — voir « Modifier les personnages » dans
   `README.md`. Le JPEG d'origine peut rester dans le dossier le temps du
   travail : il n'est ni envoyé en ligne ni versionné, mais le supprimer ensuite.
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

### Ajouter ou modifier un atelier

Les ateliers sont dans `assets/js/ateliers.js`, un par entrée, dans l'ordre de
la grille : photo, titre, résumé affiché sur la carte, paragraphes et points
abordés de la fiche plein écran. Voir la section « Modifier les ateliers » du
`README.md` pour le détail des champs.

1. Déposer la photo (720×520, WebP) dans `assets/img/ateliers/`, nommée
   `ateliers-<id>.webp`. Sans photo pour l'instant :
   `assets/img/ateliers/photo-a-venir.webp`.
2. Ajouter ou modifier l'entrée dans `assets/js/ateliers.js`.
3. `npm run check`, puis envoyer.

Attention au **titre** : il identifie l'animation dans la liste de souhaits que
les visiteurs gardent dans leur navigateur. Le renommer la retire des listes
déjà faites.

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
