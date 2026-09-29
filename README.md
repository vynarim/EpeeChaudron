# L'Épée et le Chaudron

Site vitrine mobile-first de l'association de reconstitution historique
**L'Épée et le Chaudron**, basée dans les Alpes-Maritimes.

Le site présente le camp médiéval, les animations proposées et les formats
d'intervention, à destination des organisateurs de fêtes médiévales, de
reconstitutions et de sites patrimoniaux. La troupe s'installe en herbe ou en
terre, dans un cadre historique ou champêtre. Voir [`PRODUCT.md`](PRODUCT.md).

## Fonctionnalités

- page d'accueil responsive avec présentation rapide de l'association ;
- catalogue de fiches animations ouvrables en plein écran ;
- navigation précédente/suivante entre les fiches, également au clavier ;
- ajout d'animations à une liste de souhaits depuis une fiche ou une carte ;
- conservation de cette liste dans le navigateur avec `localStorage` ;
- génération d'un courriel de contact prérempli avec les animations choisies ;
- présentation des formats court, journée et week-end sous forme d'onglets ;
- galerie des personnages de la mesnie en carrousel horizontal (portrait,
  rôle, accroche), chaque portrait ouvrant sa fiche en plein écran ;
- passage d'une fiche à la suivante aux flèches, au clavier ou d'un
  glissement du doigt, sur les animations comme sur les personnages ;
- galerie photo en carrousel horizontal : glissement au doigt, flèches,
  défilement automatique qui s'arrête dès qu'on interagit, ouverture en
  lightbox ;
- navigation mobile fixe avec indication de la section en cours de lecture ;
- bouton flottant de retour en haut après une hauteur d'écran ;
- animations d'apparition progressives respectant `prefers-reduced-motion` ;
- application web installable : le site s'ajoute à l'écran d'accueil d'un
  téléphone et s'ouvre ensuite sans barre d'adresse, y compris sans réseau.

## Accessibilité

Le site comprend notamment :

- des textes alternatifs pour les images ;
- une navigation utilisable au clavier ;
- des modales fermables avec `Échap` et un focus contenu dans la fenêtre ;
- des libellés accessibles sur les boutons et icônes ;
- une notification de liste de souhaits annoncée avec `aria-live` ;
- des cibles tactiles adaptées au mobile ;
- un lien d'accès direct au contenu.

## Éléments techniques

Le projet est un site statique sans base de données ni framework applicatif :

- HTML5 sémantique ;
- CSS responsive mobile-first ;
- JavaScript vanilla ;
- images locales optimisées en WebP ;
- SVG intégrés pour les icônes de navigation ;
- manifeste d'application (`manifest.webmanifest`) et service worker
  (`sw.js`) : voir « Application installable » plus bas ;
- Vite utilisé uniquement comme serveur de développement local ;
- aucune API ni ressource externe obligatoire ;
- déploiement possible par simple copie FTP/SFTP.

Les interactions sont regroupées dans `assets/js/main.js`. Les photos de la
galerie sont déclarées dans `assets/js/photos.js`, les ateliers dans
`assets/js/ateliers.js` et les personnages dans `assets/js/personnages.js` ;
les cartes sont générées au chargement de la page.

## Structure

```text
index.html                 Structure et contenu de la page
manifest.webmanifest       Description de l'application installable
sw.js                      Service worker : consultation hors ligne
assets/css/style.css       Charte graphique et responsive
assets/js/main.js          Navigation et interactions
assets/js/photos.js        Données de la galerie photo
assets/js/ateliers.js      Données des ateliers et animations
assets/js/personnages.js   Données des personnages
assets/img/full/           Images en grand format
assets/img/thumbs/         Miniatures de la galerie photo
assets/img/ateliers/       Photos des ateliers (720×520)
assets/img/personnages/    Portraits des personnages (300×400)
assets/img/icons/          Icônes d'application et captures d'installation
deploy/prod.htaccess       Configuration Apache de la racine (HTTPS, redirections)
deploy/v2-sw.js            Désinscrit le service worker de l'ancienne recette /v2/
scripts/check-project.mjs  Contrôle des fichiers, du manifeste et des chemins
scripts/deploy.sh          Mise en ligne du site sur https://epee-chaudron.fr/
scripts/verif-serveur.sh   Contrôle que le serveur n'a rien reçu d'autre que nos envois
scripts/sftp-commun.sh     Accès SFTP partagé par les deux scripts
deploy/etat-en-ligne.txt   Ce qui est en ligne d'après le dernier envoi (tailles, empreintes)
README_DEPLOIEMENT.md      Procédure de déploiement et de mise à jour du contenu
AGENTS.md                  Règles à respecter avant de modifier le site
PRODUCT.md                 Cible, positionnement et intentions
DESIGN.md                  Charte graphique et ses règles
```

Les photos suivent la convention `section-sujet.webp`, par exemple
`ateliers-cuisine.webp` ou `galerie-camp-troupe.webp`. Un atelier qui n'a pas
encore de photo utilise `assets/img/ateliers/photo-a-venir.webp` : le jour où
la photo existe (720×520), il suffit de changer son champ `img` dans
`assets/js/ateliers.js`.

## Développement local

Prérequis : une version récente de Node.js et npm.

```bash
npm install
npm run dev
```

Vite affiche ensuite l'adresse locale du site.

Le site peut aussi être consulté sans installation en ouvrant directement
`index.html`, ou avec une extension comme Live Server.

## Vérifications

```bash
npm run check
```

Cette commande contrôle notamment :

- la présence des fichiers indispensables ;
- les chemins des images et ressources ;
- plusieurs éléments critiques de la structure HTML/CSS ;
- la validité du manifeste, ses champs obligatoires, ses icônes 192 et 512,
  la présence d'une icône « maskable » et l'existence de chaque image
  qu'il déclare.

## Application installable

Le site se comporte comme une application : sur téléphone, le navigateur
propose de l'ajouter à l'écran d'accueil ; il s'ouvre ensuite sans barre
d'adresse, et reste consultable sans réseau — utile sur une fête médiévale où
la 4G ne passe pas toujours.

Trois pièces, solidaires :

| Fichier | Rôle |
| --- | --- |
| `manifest.webmanifest` | nom, description, couleurs, icônes, captures d'écran et raccourcis |
| `sw.js` | service worker : garde une copie du site pour la consultation hors ligne |
| `assets/img/icons/` | icônes 192 et 512 (normales et « maskable »), icône iOS, favicon, captures |

Le service worker travaille en **réseau d'abord** : la version en ligne gagne
toujours, le cache ne sert que de filet quand la connexion manque. C'est ce qui
permet de remplacer une photo par un fichier du même nom sans que personne ne
reste bloqué sur l'ancienne. Ne pas le passer en « cache d'abord » sans mettre
en place, en échange, un numéro de version sur chaque fichier.

Le premier chargement met en cache la coquille du site (page, styles, scripts,
les deux photos du haut de page) ; les autres photos s'y ajoutent au fil de la
visite. Hors ligne, le site s'affiche donc complet dès la première visite, et
les photos déjà vues restent disponibles.

Pour refabriquer les icônes à partir d'une nouvelle photo de bannière, voir
[`README_DEPLOIEMENT.md`](README_DEPLOIEMENT.md).

## Modifier la galerie

1. Ajouter l'image optimisée dans `assets/img/full/`.
2. Ajouter sa miniature dans `assets/img/thumbs/`.
3. Déclarer la photo dans `assets/js/photos.js`.

```js
{
  src: 'assets/img/full/galerie-camp-exemple.webp',
  thumb: 'assets/img/thumbs/galerie-camp-exemple.webp',
  title: 'Titre de la photo',
  category: 'Camp',
  alt: 'Description précise de la photo'
}
```

La catégorie n'est plus affichée (la galerie n'a plus de filtres) mais reste
renseignée pour mémoire. L'ordre du tableau est l'ordre du carrousel.

## Modifier les ateliers

Même principe : les ateliers sont déclarés dans `assets/js/ateliers.js`, dans
l'ordre de la grille, et les cartes comme les fiches plein écran sont générées
au chargement. Aucune modification de `index.html` ni du CSS n'est nécessaire.

1. Déposer la photo (720×520, WebP) dans `assets/img/ateliers/`, sous le nom
   `ateliers-<id>.webp`.
2. Ajouter une entrée dans `assets/js/ateliers.js` :

```js
{
  id: 'exemple',
  categorie: 'ateliers',          // 'camp', 'ateliers' ou 'armes'
  img: 'assets/img/ateliers/ateliers-exemple.webp',
  alt: 'Description de la photo',
  titre: 'Titre de l’animation',
  resume: 'Une phrase, affichée sur la carte.',
  texte: [
    'Premier paragraphe de la fiche plein écran.',
    'Second paragraphe.'
  ],
  points: ['Premier point abordé', 'Deuxième', 'Troisième']
}
```

**Le titre sert aussi d'identifiant** à la liste de souhaits que les visiteurs
gardent dans leur navigateur : le changer retire l'animation des listes déjà
faites. Corriger une faute, oui ; renommer, en connaissance de cause.

`npm run check` exécute le fichier et refuse un champ manquant, une catégorie
qui ne correspond à aucun filtre, un titre ou un identifiant en double, et une
photo absente.

## Modifier les personnages

Même principe que la galerie : les personnages sont déclarés dans
`assets/js/personnages.js` et les cartes sont générées au chargement. Aucune
modification de `index.html` ni du CSS n'est nécessaire.

1. Préparer le portrait (format 3/4, 900×1200, WebP) dans
   `assets/img/personnages/`. Depuis n'importe quelle photo, JPEG compris :

   ```bash
   npm run portrait -- apercu photo.jpg                     # dimensions, échelle, aperçu
   npm run portrait -- recadrer photo.jpg <x> <y> <largeur> <nom>
   npm run portrait -- planche <nom> [<nom> …]              # vérifier les cadrages
   ```

   L'outil se sert d'Edge ou de Chrome comme moteur d'image ; le détail est en
   tête de `scripts/portrait.mjs`.
2. Ajouter une entrée dans `assets/js/personnages.js`, à la place voulue dans
   l'ordre du carrousel.

```js
{
  img: 'assets/img/personnages/personnages-exemple.webp',
  name: 'Nom affiché',
  role: 'Rôle affiché sous le nom',
  hook: 'Une phrase d’accroche, en italique sur la carte.',
  alt: 'Description de la photo pour les lecteurs d’écran',
  atelier: 'L’atelier qu’il anime (facultatif, affiché dans la fiche)'
}
```

Les portraits actuels sont des reprises de l'ancien site en basse définition :
remplacer le fichier par une photo HD du même nom suffit.

## Déploiement

Le site ne nécessite aucune compilation pour être publié. Envoyer les fichiers
du projet sur le serveur web en excluant `node_modules/`.

Consulter [`README_DEPLOIEMENT.md`](README_DEPLOIEMENT.md) pour la procédure
détaillée.
