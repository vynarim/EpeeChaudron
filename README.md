# L’Épée et le Chaudron — site statique

Projet HTML/CSS/JS statique, pensé mobile-first, pour remplacer l’ancien site de l’association.

## Lancer en local

Option simple, sans installation npm : ouvrir `index.html` dans le navigateur ou utiliser l’extension VS Code “Live Server”.

Option recommandée pour travailler avec Codex :

```bash
npm install
npm run dev
```

Puis ouvrir l’URL locale affichée dans le terminal.

## Structure

```text
index.html                 Page principale
assets/css/style.css       Charte graphique et responsive
assets/js/main.js          Menu, galerie, lightbox, onglets, animations
assets/js/photos.js        Liste des photos de la galerie
assets/img/full/           Images grandes
assets/img/thumbs/         Miniatures de galerie
assets/img/logo-square.webp, favicon.png
README_DEPLOIEMENT.txt     Déploiement serveur classique
AGENTS.md                  Instructions destinées à Codex
TODO_CODEX.md              Ajustements à faire par étapes
```

Les photos utilisent la convention `section-sujet.webp`, par exemple
`animations-cuisine-feu.webp` ou `galerie-camp-troupe.webp`. Une photo
utilisée dans plusieurs sections possède une copie nommée pour chaque usage.

## Modifier les photos

1. Ajouter l’image grande dans `assets/img/full/`.
2. Ajouter ou générer une miniature dans `assets/img/thumbs/`.
3. Ajouter une entrée dans `assets/js/photos.js`.

Exemple :

```js
{src:'assets/img/full/ma-photo.webp', thumb:'assets/img/thumbs/ma-photo.webp', title:'Titre', category:'Camp', alt:'Description précise de la photo'}
```

## Déploiement

Le site ne dépend d’aucune base de données. Il suffit de déposer tout le dossier sur le serveur web. Si vous utilisez npm/Vite uniquement pour le développement local, ne déployez pas `node_modules/`.
