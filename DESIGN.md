---
name: L'Épée et le Chaudron
description: Site vitrine d'un camp médiéval vivant, aux couleurs de la bannière de l'association.
colors:
  royal-blue: "#123d91"
  navy-deep: "#071a44"
  banner-gold: "#f2cc28"
  ember-fire: "#c23f16"
  ink: "#17120d"
  text: "#2c271f"
  muted-clay: "#6a6257"
  canvas-light: "#f7efe0"
  canvas-lightest: "#fffaf0"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.6rem, 3vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.6rem, 2.6vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "1.07rem"
    fontWeight: 700
    lineHeight: 1.18
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: "0.09em"
rounded:
  xs: "10px"
  sm: "14px"
  md: "18px"
  lg: "22px"
  xl: "24px"
  pill: "999px"
  full: "50%"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "38px"
  xl: "62px"
components:
  button-primary:
    backgroundColor: "{colors.banner-gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.68rem 1rem"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.pill}"
    padding: "0.68rem 1rem"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "16px"
  tab-active:
    backgroundColor: "{colors.banner-gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  nav-contact:
    backgroundColor: "{colors.royal-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
  module-filter:
    backgroundColor: "#ffffff"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 0.72rem"
  module-filter-active:
    backgroundColor: "{colors.royal-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
  carousel-arrow:
    backgroundColor: "{colors.navy-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    size: "44px"
  icon-button:
    backgroundColor: "#ffffff"
    textColor: "{colors.ember-fire}"
    rounded: "{rounded.full}"
    size: "44px"
---

# Design System: L'Épée et le Chaudron

## 1. Overview

**Creative North Star: "La Bannière"**

Toute la palette du site vient directement de la bannière de l'association : bleu royal, or et une pointe de feu. Le système visuel traite ces trois couleurs comme un emblème d'authenticité répété partout — badge du hero, cartes du format d'intervention, bande photo, flèches des carrousels — plutôt que comme des couleurs de marque abstraites. L'objectif n'est pas de décorer un site associatif, c'est de faire reconnaître la mesnie au premier coup d'œil, exactement comme sa bannière la fait reconnaître sur un événement.

Le système rejette explicitement le faux parchemin, les grosses polices médiévales peu lisibles, les effets fantasy lourds (écussons décoratifs, ornements gothiques) et les fonds trop sombres : la crédibilité vient des photos réelles du camp et d'une mise en page sobre, pas d'un habillage "fantasy template". La densité reste volontairement raisonnable — titres courts, sections qui respirent sans être vides — pour qu'un décideur municipal perçoive une structure professionnelle en quelques secondes.

**Key Characteristics:**
- Palette héritée directement de la bannière physique de l'association (bleu, or, feu), jamais de couleurs de marque génériques.
- Titres en serif classique (Georgia) posés sur un corps de texte sans-serif système, pour un contraste sobre plutôt qu'un habillage "fantasy".
- Deux familles d'ombres : les surfaces qui restent en place (cartes, panneaux) sont teintées encre ou bleu marine pour porter la couleur de marque ; les contrôles flottants qui doivent rester lisibles sur n'importe quel fond (badges, boutons icône, notifications) utilisent un noir neutre.
- Les photos du camp portent l'expérience ; la couleur souligne, elle ne remplace jamais l'image.

## 2. Colors

La palette est **committed** : le bleu royal et l'or de bannière portent la majorité des surfaces d'accent (header, CTA, badges, fonds de section), le feu reste un accent rare réservé aux eyebrows et aux indicateurs d'action (liste de souhaits).

### Primary
- **Bleu royal** (`#123d91`): couleur de marque dominante — dégradé du hero, CTA de navigation, titres de cartes, flèches et jauge des carrousels.
- **Navy profond** (`#071a44`): variante sombre du bleu royal, utilisée en fin de dégradé et pour les fonds pleins (footer, panneau des formats d'intervention).

### Secondary
- **Or de bannière** (`#f2cc28`): accent chaleureux réservé aux actions principales (bouton primaire, onglet actif) et aux liserés qui signalent "c'est officiel, c'est la bannière".

### Tertiary
- **Rouge feu** (`#c23f16`): accent rare et fonctionnel — texte des eyebrows, icône de liste de souhaits activée. Jamais utilisé en fond de section. Assombri depuis `#d94a1e` pour passer 4.5:1 sur `canvas-lightest`.

### Neutral
- **Encre** (`#17120d`): titres et texte le plus foncé.
- **Texte** (`#2c271f`): corps de texte par défaut.
- **Argile mate** (`#6a6257`): texte secondaire, légendes, sous-titres.
- **Toile claire** (`#f7efe0`): fond des sections alternées ("paper").
- **Toile la plus claire** (`#fffaf0`): fond de page par défaut et surface du header.

### Named Rules
**La Règle de la Bannière.** Toute nouvelle couleur d'accent doit se justifier par rapport aux trois couleurs de la bannière (bleu, or, feu) ; pas de couleur de marque ajoutée qui n'existe pas physiquement sur la bannière de l'association.

## 3. Typography

**Display/Headline Font:** Georgia, 'Times New Roman', serif
**Body/Label Font:** system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif

**Character:** Un serif classique et sobre pour les titres (autorité historique sans "fantasy"), posé sur un sans-serif système neutre pour tout le reste — le contraste fait la hiérarchie, pas la taille.

### Hierarchy
- **Display** (400, `clamp(1.6rem, 3vw, 2.5rem)`, line-height 1.06): titre du hero uniquement.
- **Headline** (400, `clamp(1.6rem, 2.6vw, 2.25rem)`, line-height 1.1): titres de section (`h2`).
- **Title** (700, 1.07rem, line-height 1.18): titres de carte (`h3`), en bleu marine.
- **Body** (400, 1rem, line-height 1.55): texte courant ; les paragraphes de présentation restent sous 70ch grâce aux grilles contraintes.
- **Label** (900, 0.75rem, letter-spacing 0.09em, uppercase, couleur feu): réservé à 2 usages délibérés (le hero, et la section « Pour les organisateurs »), jamais répété au-dessus de chaque section. La bande photo porte un label équivalent en or sur navy.

### Named Rules
**La Règle du Titre Sobre.** Le display ne dépasse jamais `2.5rem` et reste en serif classique — jamais de police "fantasy" épaisse ou décorative, même sur le hero.

**La Règle de l'Eyebrow Rare.** Le label eyebrow est réservé à des usages ponctuels et délibérés (2 sur la page entière), jamais répété au-dessus de chaque section — un eyebrow sur toutes les sections est un réflexe IA, pas un système de marque.

## 4. Elevation

Le système est **layered** : les surfaces importantes (carte hero, format d'intervention, modales) flottent sur une ombre douce et large plutôt que d'utiliser des bordures dures. Le seul flou décoratif est fonctionnel : le `backdrop-filter: blur(16px)` du header sticky, qui garde la navigation lisible au défilement — ce n'est pas du glassmorphism gratuit.

### Shadow Vocabulary

**Ombres de surface** (teintées, portent la couleur de marque) :
- **Resting** (`box-shadow: 0 8px 24px rgba(23,18,13,.06)`): cartes d'animation au repos.
- **Elevated** (`box-shadow: 0 16px 42px rgba(7,26,68,.16)`, token `--shadow`): carte hero, bannière intro, panneau des formats, images jumelles de la section association, popover de nav mobile. La carte contact n'a volontairement pas d'ombre — elle repose déjà sur le dégradé bleu de sa section.
- **Hover-lift** (`box-shadow: 0 12px 28px rgba(23,18,13,.12)`): survol des cartes d'animation cliquables.
- **Nav-shadow** (`box-shadow: 0 -8px 24px rgba(7,26,68,.22)`): ombre montante de la barre de navigation mobile fixe.

**Ombres de contrôle flottant** (noir neutre, doivent rester lisibles sur n'importe quel fond) :
- **Modal** (`box-shadow: 0 24px 70px rgba(0,0,0,.38)`): fiche animation en plein écran.
- **Floating icon** (`box-shadow` de `0 1px 4px rgba(0,0,0,.08)` à `0 12px 34px rgba(0,0,0,.3)` selon la taille du contrôle): badge hero, boutons de liste de souhaits, fermetures de modale/lightbox, flèches de navigation, retour-en-haut, notification — tous des éléments qui flottent au-dessus de photos ou de fonds variables.

### Named Rules
**La Règle de la Double Ombre.** Une surface qui reste ancrée dans la page (carte, panneau, popover) porte une ombre teintée encre ou bleu marine — l'élévation fait partie de l'identité. Un contrôle qui flotte au-dessus de n'importe quel contenu (badge, bouton icône, modale, notification) porte une ombre neutre, parce qu'il doit rester lisible qu'il survole une photo, une carte claire ou un fond sombre.

## 5. Components

Le ressenti général est **rassurant et structuré** : priorité à la clarté et à la hiérarchie pour qu'un décideur (mairie, organisateur) évalue le sérieux du site en un coup d'œil, sans effet superflu.

### Buttons
- **Shape:** pilule (`border-radius: 999px`).
- **Primary:** fond or de bannière (`#f2cc28`), texte encre (`#17120d`), padding `0.68rem 1rem`.
- **Secondary:** fond blanc, texte navy profond (`#071a44`), bordure `rgba(18,61,145,.22)`.
- **Hover:** léger décollement (`translateY(-1px)`), sans changement de couleur.

### Tabs / Filtres (pilules segmentées)
- **Onglets des formats** (sur le panneau navy) : fond blanc translucide (`rgba(255,255,255,.12)`), texte blanc ; actif = fond or de bannière, texte encre.
- **Filtres des animations** (sur fond clair) : même forme pilule, fond blanc et bordure `--line` au repos ; actif = fond bleu royal, texte blanc. La galerie photo n'a pas de filtres.

### Lightbox / Modale (navigation précédent/suivant)
- **Style:** boutons circulaires 48px (44px sur mobile), fond navy semi-opaque, bordure or fine, chevron blanc dessiné en SVG (jamais un caractère `‹ ›`, dont le centrage dépend de la police).
- **Comportement:** identique entre la lightbox et la modale d'animation — flèches clavier ArrowLeft/ArrowRight, cycle en boucle.

### Carrousels (galerie photo, personnages)
- **Mécanique:** défilement horizontal natif (`scroll-snap`), une carte accrochée à la fois ; le nombre de cartes visibles est une variable `--per` par palier (photos 3 / 2 / 1, personnages 4 / 3 / 2,4 / 1,35 — la fraction laisse dépasser la carte suivante sur téléphone pour suggérer le geste).
- **Contrôles:** deux flèches rondes 40px (navy, liseré or, chevron SVG) de part et d'autre ; entre elles, des points pour une série courte (personnages) ou une jauge fine + compteur « 3 / 17 » pour une série longue (photos).
- **Défilement automatique:** 4,5–5,2 s, uniquement quand le carrousel est à l'écran ; en pause au toucher, au survol, au focus, et désactivé sous `prefers-reduced-motion`.
- **Légende photo:** un mot posé sur la photo en bas à gauche, fond navy à 55 % flouté, sans liseré — jamais de légende sous la photo.
- **Carte personnage:** portrait 3/4 (4/5 sur téléphone), nom en navy, rôle en bleu royal, accroche en italique argile. Pas d'étiquette de famille ni de fiche au clic.

### Boutons icône flottants (cœur, fermeture, retour-en-haut)
- **Shape:** cercle plein (`border-radius: 50%`), 44×44px minimum partout — cible tactile avant tout.
- **Style:** fond blanc ou navy selon le contexte, icône encre/feu/or, ombre flottante neutre (voir Elevation).
- **État actif** (cœur de liste de souhaits) : fond feu plein, icône blanche.

### Cards / Containers
- **Corner Style:** 18px (`--radius`) pour les cartes standard ; 22–24px pour les surfaces mises en avant (hero, formats, modale).
- **Background:** blanc sur fond clair ; navy profond sur les surfaces sombres (panneau des formats).
- **Shadow Strategy:** voir Elevation — resting par défaut, hover-lift au survol pour les cartes cliquables.
- **Border:** `1px solid rgba(23,18,13,.13)` (`--line`) sur les cartes claires.
- **Internal Padding:** 14–16px sur les cartes compactes, jusqu'à `clamp(24px, 3.2vw, 38px)` sur la carte hero.

### Navigation
- **Style:** liens en pilule, fond transparent au repos, teinte bleu royal légère au survol/focus (`rgba(18,61,145,.08)`). Le lien contact est un bouton plein bleu royal, texte blanc.
- **Mobile:** barre de navigation basse fixe avec icônes SVG et libellés courts ; l'onglet actif prend un fond navy profond avec texte or.

### Badge / Bannière photo (signature)
Le badge du hero (« Alpes-Maritimes · association loi 1901 ») et la légende de la bande photo utilisent un fond navy semi-opaque sur l'image, avec une bordure or fine et complète (pas un liseré latéral) pour signaler l'authenticité.

## 6. Do's and Don'ts

### Do:
- **Do** garder la priorité absolue au rendu téléphone ; le desktop doit rester propre et lisible pour les organisateurs.
- **Do** laisser les photos porter l'expérience — ne jamais les remplacer par des placeholders ou des illustrations génériques.
- **Do** garder les boutons de contact visibles mais discrets (pilule or ou blanc, jamais criard).
- **Do** suivre la Règle de la Double Ombre : teinte encre/marine pour les surfaces ancrées dans la page, noir neutre pour les contrôles qui flottent au-dessus de contenu variable.
- **Do** garder les cartes compactes et la densité de texte raisonnable : titres courts, pas de blocs de texte imposants.

### Don't:
- **Don't** utiliser de faux effet parchemin, de grosses polices médiévales décoratives ou d'ornements "fantasy" lourds.
- **Don't** assombrir excessivement les arrière-plans — la palette reste lisible, jamais un site sombre par défaut.
- **Don't** faire ressembler une section à un template de landing page générique (grilles de cartes identiques à l'infini, dégradé texte, etc.).
- **Don't** réintroduire un hero plein écran massif ou grossir les titres au-delà de l'échelle Display définie ici.
- **Don't** intégrer un flux Facebook directement dans la page.
- **Don't** utiliser une bordure latérale colorée (`border-left`/`border-right`) comme accent décoratif sur un badge, une carte ou une notification — toujours une bordure complète, un fond teinté, ou rien.
- **Don't** répéter le même eyebrow au-dessus de chaque section — voir la Règle de l'Eyebrow Rare.
