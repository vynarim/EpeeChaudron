# Instructions pour les agents

Site vitrine statique de l'association de reconstitution historique
« L'Épée et le Chaudron ». Ce fichier est lu automatiquement par les agents de
code : il fixe les règles à respecter avant toute modification.

À lire aussi selon le sujet : [`PRODUCT.md`](PRODUCT.md) pour la cible et le
positionnement, [`DESIGN.md`](DESIGN.md) pour la charte graphique et ses
règles, [`README.md`](README.md) pour la structure du dépôt,
[`README_DEPLOIEMENT.md`](README_DEPLOIEMENT.md) pour l'hébergement et la mise
à jour du contenu.

## Cible

Le site s'adresse d'abord aux organisateurs de fêtes médiévales, de
reconstitutions et de sites patrimoniaux. La troupe s'installe en herbe ou en
terre, dans un cadre historique ou champêtre — jamais en salle des fêtes, en
mariage ou sur du béton en ville moderne. Les interventions en école restent
exceptionnelles. Voir `PRODUCT.md`.

## Priorités UX

1. Priorité absolue au rendu téléphone ; le desktop doit rester propre pour les
   décideurs.
2. Éviter tout rendu « template landing page générique ».
3. Densité raisonnable : textes courts, titres sobres, sections qui respirent
   sans devenir des écrans vides.
4. Les photos portent l'expérience. Ne pas surdimensionner les typographies.
5. Les boutons de contact restent visibles sans être agressifs.
6. Les galeries (photos, personnages) défilent horizontalement : pas de grille
   qui allonge la page, pas de filtres, pas de légende sous les photos.

## Contraintes techniques

- Site statique uniquement : HTML, CSS, JavaScript vanilla, une seule page.
- Pas de framework lourd, pas de bibliothèque CSS/JS ajoutée.
- Pas de dépendance à Facebook, pas d'appel externe obligatoire.
- Garder le site déployable par simple copie FTP/SFTP.
- Accessibilité : alt d'images, contraste ≥ 4.5:1, navigation clavier, cibles
  tactiles de 44 px minimum, `prefers-reduced-motion` respecté.
- Ne pas supprimer `README_DEPLOIEMENT.md`.

## Où se trouve quoi

- `index.html` — structure, textes, fiches des animations.
- `assets/css/style.css` — charte, responsive, carrousels. Organisé en
  sections ; ne pas réintroduire de CSS minifié ni de règles dupliquées.
- `assets/js/photos.js` — données de la galerie photo.
- `assets/js/personnages.js` — données des personnages.
- `assets/js/main.js` — interactions ; à ne toucher que si le comportement doit
  changer.

Ajouter une photo ou un personnage se fait dans les fichiers de données, sans
modifier `index.html` ni le CSS.

## Règles de style mobile

- Écran 360–430 px : aucun titre ne doit occuper plus de 3 lignes dans le hero.
- Corps de texte à 16 px ; aucun paragraphe sous 15 px.
- Les cartes restent compactes, le header discret.
- Éviter les sections de plus d'un écran complet sans interaction ou image
  forte.

## À ne pas faire

- Réintroduire un hero plein écran massif ou grossir les titres au-delà de
  l'échelle de `DESIGN.md`.
- Faux parchemin, polices médiévales décoratives, ornements fantasy, fonds
  sombres par défaut.
- Intégrer un flux Facebook dans la page.
- Afficher des tarifs : ils ne figurent pas sur le site, volontairement.
- Écrire l'adresse de contact ailleurs que dans le bouton `mailto:` et
  `assets/js/main.js`.
- Remplacer les photos du camp par des placeholders génériques. Une animation
  sans photo utilise `assets/img/thumbs/photo-a-venir.webp`.

## Commandes utiles

```bash
npm install
npm run dev      # serveur local Vite
npm run check    # présence des fichiers, chemins d'images, éléments critiques
```
