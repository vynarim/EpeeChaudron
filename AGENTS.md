# Instructions pour Codex

## Objectif

Améliorer un site statique mobile-first pour l’association de reconstitution historique “L’Épée et le Chaudron”. Le site doit convaincre rapidement des mairies, organisateurs d’événements, sites patrimoniaux, médiathèques, écoles et publics familiaux.

## Priorités UX

1. Priorité absolue au rendu téléphone.
2. Le site doit rester propre et lisible sur ordinateur, notamment pour les mairies.
3. Éviter tout rendu “template landing page générique”.
4. Conserver une densité raisonnable : textes courts, titres sobres, sections respirantes mais pas énormes.
5. Les photos doivent porter l’expérience. Ne pas surdimensionner les typographies.
6. Les boutons de contact doivent être visibles mais pas agressifs.

## Charte graphique

La charte vient de la bannière de l’association :

- bleu royal profond ;
- jaune or ;
- noir / charbon ;
- rouge feu en accent secondaire ;
- matières visuelles : toile, bois, métal, feu, pierre.

Éviter le faux parchemin excessif, les grosses polices médiévales peu lisibles, les effets fantasy lourds et les arrière-plans trop sombres.

## Contraintes techniques

- Site statique uniquement : HTML, CSS, JavaScript vanilla.
- Pas de framework lourd.
- Pas de dépendance à Facebook.
- Pas d’appel externe obligatoire.
- Garder le site déployable par simple copie FTP/SFTP.
- Maintenir l’accessibilité : alt d’images, contraste suffisant, navigation clavier, tailles de cible tactiles correctes.
- Ne pas supprimer `README_DEPLOIEMENT.md`.

## Fichiers à modifier en priorité

- `index.html` pour la structure et les textes.
- `assets/css/style.css` pour le rendu mobile, desktop, espacements et charte.
- `assets/js/photos.js` pour organiser la galerie.
- `assets/js/main.js` uniquement si l’interaction doit évoluer.

## Règles de style mobile

- Écran 360–430 px : aucun titre ne doit occuper plus de 3 lignes dans le hero.
- Les cartes doivent rester compactes.
- Les galeries (photos, personnages) défilent horizontalement : pas de grille qui allonge la page, pas de filtres, pas de légende sous les photos.
- Le header doit rester discret.
- Éviter les sections de plus d’un écran complet sans interaction ou image forte.

## À ne pas faire

- Ne pas réintroduire de hero plein écran massif.
- Ne pas grossir les titres au-delà du nécessaire.
- Ne pas intégrer directement un flux Facebook.
- Ne pas ajouter de bibliothèques CSS/JS lourdes.
- Ne pas remplacer toutes les photos par des placeholders.
- Ne pas transformer le site en application complexe.

## Commandes utiles

```bash
npm install
npm run dev
npm run check
```

`npm run check` vérifie surtout la présence des fichiers référencés, les chemins d’images et quelques éléments HTML/CSS critiques.
