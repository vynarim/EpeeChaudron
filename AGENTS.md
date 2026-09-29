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

- `index.html` — structure et textes de la page.
- `assets/css/style.css` — charte, responsive, carrousels. Organisé en
  sections ; ne pas réintroduire de CSS minifié ni de règles dupliquées.
- `assets/js/photos.js` — données de la galerie photo.
- `assets/js/ateliers.js` — données des ateliers : cartes et fiches plein
  écran. Le `titre` identifie l'animation dans la liste de souhaits des
  visiteurs : ne pas le renommer à la légère.
- `assets/js/personnages.js` — données des personnages.
- `assets/js/main.js` — interactions ; à ne toucher que si le comportement doit
  changer.
- `manifest.webmanifest` — description de l'application installable.
- `sw.js` — service worker, stratégie « réseau d'abord ». Lire l'en-tête du
  fichier avant d'y toucher.
- `assets/img/icons/` — icônes d'application et captures d'installation.

Ajouter une photo, un atelier ou un personnage se fait dans les fichiers de
données, sans modifier `index.html` ni le CSS.

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
  sans photo utilise `assets/img/ateliers/photo-a-venir.webp`.
- Passer le service worker en « cache d'abord » : les photos et les textes sont
  remplacés par des fichiers du même nom, les visiteurs resteraient bloqués sur
  d'anciennes versions.
- Ajouter un fichier servi à la racine sans l'ajouter à `scripts/deploy.sh` :
  il n'arriverait jamais sur le serveur.

## Commandes utiles

```bash
npm install
npm run dev                          # serveur local Vite
npm run check                        # fichiers, chemins d'images, manifeste
bash scripts/deploy.sh --dry-run     # ce qui partirait en ligne (site public)
```

Attention en développement local : Vite sert la feuille de style en
`text/javascript` pour son rechargement à chaud. Un test hors ligne fait sur
`npm run dev` montre donc une page sans styles — ce n'est pas un défaut du
service worker. Tester hors ligne sur le site déployé.
