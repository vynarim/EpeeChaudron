# L'Épée et le Chaudron

Site vitrine mobile-first de l'association de reconstitution historique
**L'Épée et le Chaudron**, basée dans les Alpes-Maritimes.

Le site présente le camp médiéval, les animations proposées et les formats
d'intervention destinés aux communes, sites patrimoniaux, écoles,
médiathèques et événements familiaux.

## Fonctionnalités

- page d'accueil responsive avec présentation rapide de l'association ;
- catalogue de fiches animations ouvrables en plein écran ;
- navigation précédente/suivante entre les fiches, également au clavier ;
- ajout d'animations à une liste de souhaits depuis une fiche ou une carte ;
- conservation de cette liste dans le navigateur avec `localStorage` ;
- génération d'un courriel de contact prérempli avec les animations choisies ;
- présentation des formats court, journée et week-end sous forme d'onglets ;
- galerie photo filtrable par catégorie avec affichage en lightbox ;
- navigation mobile fixe avec indication de la section en cours de lecture ;
- bouton flottant de retour en haut après une hauteur d'écran ;
- animations d'apparition progressives respectant `prefers-reduced-motion`.

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
- Vite utilisé uniquement comme serveur de développement local ;
- aucune API ni ressource externe obligatoire ;
- déploiement possible par simple copie FTP/SFTP.

Les interactions sont regroupées dans `assets/js/main.js`. Les photos de la
galerie sont déclarées dans `assets/js/photos.js` puis générées dynamiquement.

## Structure

```text
index.html                 Structure et contenu de la page
assets/css/style.css       Charte graphique et responsive
assets/js/main.js          Navigation et interactions
assets/js/photos.js        Données de la galerie
assets/img/full/           Images en grand format
assets/img/thumbs/         Miniatures et images des cartes
scripts/check-project.mjs  Contrôle des fichiers et chemins
README_DEPLOIEMENT.txt     Procédure de déploiement classique
AGENTS.md                  Instructions de contribution pour Codex
```

Les photos suivent la convention `section-sujet.webp`, par exemple
`animations-cuisine-feu.webp` ou `galerie-camp-troupe.webp`.

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
- plusieurs éléments critiques de la structure HTML/CSS.

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

Catégories actuelles : `Camp`, `Cuisine`, `Armes` et `Ateliers`.

## Déploiement

Le site ne nécessite aucune compilation pour être publié. Envoyer les fichiers
du projet sur le serveur web en excluant `node_modules/`.

Consulter [`README_DEPLOIEMENT.txt`](README_DEPLOIEMENT.txt) pour la procédure
détaillée.
