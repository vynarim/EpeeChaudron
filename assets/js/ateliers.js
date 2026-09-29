// Ateliers et animations de la mesnie, dans l'ordre d'affichage de la grille.
// Pour en ajouter un : déposer sa photo dans assets/img/ateliers/ (720 × 520,
// WebP, nommée ateliers-<id>.webp) puis ajouter une entrée ici. Rien d'autre
// à modifier : ni index.html, ni le CSS.
//
//   id        : identifiant court, sans accent ni espace. Donne son nom au
//               fichier image.
//   categorie : 'camp', 'ateliers' ou 'armes' — les trois filtres au-dessus
//               de la grille.
//   img       : chemin de la photo. Sans photo pour l'instant :
//               'assets/img/ateliers/photo-a-venir.webp'.
//   alt       : description de la photo pour les lecteurs d'écran.
//   titre     : nom de l'animation. ATTENTION — il sert aussi d'identifiant à
//               la liste de souhaits que les visiteurs gardent dans leur
//               navigateur : le modifier retire l'animation des listes déjà
//               faites. Corriger une faute, oui ; renommer, en connaissance
//               de cause.
//   resume    : une phrase, affichée sur la carte.
//   texte     : les paragraphes de la fiche plein écran.
//   points    : FACULTATIF — la liste « Points abordés » en bas de la fiche.
window.EC_ATELIERS = [
  {
    id: 'cuisine',
    categorie: 'ateliers',
    img: 'assets/img/ateliers/ateliers-cuisine.webp',
    alt: 'Cuisine au feu médiévale',
    titre: 'Cuisine au feu',
    resume: 'Feu, ustensiles, recettes, gestes quotidiens et arts de la table.',
    texte: [
      'Autour du foyer, le public découvre comment on préparait et partageait les repas au Moyen Âge. Les explications portent sur l’allumage et l’entretien du feu, les ustensiles, les modes de cuisson, les ingrédients disponibles et l’organisation quotidienne du camp.',
      'La présentation permet aussi d’aborder les différences sociales, la conservation des aliments et les arts de la table. Les échanges s’adaptent à l’âge du public et aux objets effectivement présentés le jour de l’animation.'
    ],
    points: ['Foyer, chaudrons et ustensiles', 'Recettes et ingrédients historiques', 'Gestes quotidiens et service de table']
  },
  {
    id: 'heraldique',
    categorie: 'ateliers',
    img: 'assets/img/ateliers/ateliers-heraldique.webp',
    alt: 'Écus peints aux couleurs de blasons et tableau des émaux et fourrures, sur la table de l’atelier',
    titre: 'Héraldique',
    resume: 'Couleurs, meubles, blasons et atelier très visuel pour le public.',
    texte: [
      'L’héraldique est présentée comme un langage visuel construit pour identifier une personne, une famille ou une communauté. Le public apprend à reconnaître les couleurs, les partitions et les figures qui composent un blason.',
      'Selon le contexte, l’animation peut prendre la forme d’une démonstration, d’un échange autour des bannières ou d’un petit exercice de composition. Elle fonctionne particulièrement bien avec les enfants et les groupes scolaires.'
    ],
    points: ['Vocabulaire et règles de composition', 'Lecture de blasons et de bannières', 'Création guidée d’armoiries']
  },
  {
    id: 'armes-armures',
    categorie: 'armes',
    img: 'assets/img/ateliers/ateliers-armes-armures.webp',
    alt: 'Présentation d’armes médiévales au public',
    titre: 'Armes et armures',
    resume: 'L’équipement du combattant, à toucher et à essayer, du Moyen Âge à la Renaissance.',
    texte: [
      'Cette présentation replace les armes et les protections dans leur contexte historique. Formes, matériaux, poids, entretien et évolution sont expliqués à partir de reproductions manipulées par les membres de l’association.',
      'L’objectif n’est pas le spectacle de combat, mais la compréhension du matériel et des gestes. La démonstration reste encadrée et adaptée à l’espace disponible ainsi qu’au public présent.'
    ],
    points: ['Équipement du combattant', 'Fabrication, entretien et évolution', 'Démonstrations commentées et sécurisées']
  },
  {
    id: 'textile',
    categorie: 'ateliers',
    img: 'assets/img/ateliers/ateliers-textile.webp',
    alt: 'Démonstration de tissage médiéval',
    titre: 'Textile et tissage',
    resume: 'Une animation calme, pédagogique et très adaptée aux familles.',
    texte: [
      'De la fibre au vêtement, cette animation montre les nombreuses étapes nécessaires avant de pouvoir se vêtir. Le public observe les matières, les outils et les gestes liés au filage, au tissage et aux finitions.',
      'Le module invite naturellement aux questions et à l’observation rapprochée. Il peut compléter une présentation du costume, des couleurs ou de la place du travail textile dans la vie quotidienne.'
    ],
    points: ['Fibres, fils et teintures', 'Outils et techniques de tissage', 'Vêtements et usages selon les époques']
  },
  {
    id: 'ecriture',
    categorie: 'ateliers',
    img: 'assets/img/ateliers/ateliers-ecriture.webp',
    alt: 'Scribe médiéval dans une tente',
    titre: 'Écriture et pigments',
    resume: 'Calligraphie, supports, couleurs et petits objets de camp.',
    texte: [
      'Le public découvre les supports de l’écrit, les outils du scribe et la préparation des couleurs. La démonstration permet de comprendre la lenteur du geste, le coût des matériaux et la valeur accordée aux documents.',
      'Des exemples de lettres, de décors et de pigments rendent le sujet concret. Le contenu peut être orienté vers la calligraphie, l’enluminure ou les usages de l’écrit selon le lieu et le temps disponible.'
    ],
    points: ['Plumes, encres et supports', 'Fabrication et usage des pigments', 'Calligraphie et décor des manuscrits']
  },
  {
    id: 'vie-de-camp',
    categorie: 'camp',
    img: 'assets/img/ateliers/ateliers-vie-de-camp.webp',
    alt: 'Tente médiévale rose et grise',
    titre: 'Vie de camp',
    resume: 'Tentes, mobilier, tables, costumes et interactions continues.',
    texte: [
      'La vie de camp relie tous les autres modules. Tentes, mobilier, vêtements, repas et activités composent un espace habité dans lequel le public peut circuler et échanger avec les membres de la mesnie.',
      'Plutôt qu’un décor figé, le camp évolue au fil de la journée : préparation des repas, entretien du matériel, artisanat et présentations ponctuelles. Cette présence continue crée un point d’attraction visible dans l’événement.'
    ],
    points: ['Installation et organisation du camp', 'Mobilier, costumes et objets quotidiens', 'Échanges continus avec les visiteurs']
  },
  {
    id: 'bourreau',
    categorie: 'armes',
    img: 'assets/img/ateliers/ateliers-bourreau.webp',
    alt: 'Personnage du bourreau devant le camp médiéval',
    titre: 'Bourreau',
    resume: 'Justice médiévale, métier du bourreau, croyances et idées reçues.',
    texte: [
      'À travers le personnage du bourreau, cette animation aborde la justice au Moyen Âge, ses acteurs et les peines prononcées. Le public découvre un métier à part, entouré de nombreuses croyances et souvent très différent de l’image transmise par les films.',
      'La présentation privilégie l’histoire, les objets et les échanges avec le public, sans mise en scène complaisante. Le discours est adapté à l’âge des visiteurs et au cadre de l’événement.'
    ],
    points: ['Justice et peines au Moyen Âge', 'Statut et quotidien du bourreau', 'Mythes, croyances et réalité historique']
  },
  {
    id: 'lessive',
    categorie: 'camp',
    img: 'assets/img/ateliers/ateliers-lessive.webp',
    alt: 'Objets de la vie quotidienne sur le camp médiéval',
    titre: 'Lessive à la cendre',
    resume: 'Une démonstration concrète des techniques d’entretien du linge.',
    texte: [
      'Cette animation explique comment les propriétés de la cendre étaient utilisées pour laver le linge. Les différentes étapes sont présentées depuis la préparation de la lessive jusqu’au rinçage, avec les récipients et les gestes associés.',
      'Le sujet permet d’aborder l’hygiène, l’organisation domestique, la consommation d’eau et le travail nécessaire à l’entretien des textiles avant les produits modernes.'
    ],
    points: ['Préparation de la lessive de cendre', 'Lavage, rinçage et séchage du linge', 'Hygiène et tâches domestiques']
  },
  {
    id: 'medecine',
    categorie: 'camp',
    img: 'assets/img/ateliers/photo-a-venir.webp',
    alt: 'Photo à venir',
    titre: 'Médecine',
    resume: 'Remèdes, plantes et idées reçues sur la médecine du Moyen Âge.',
    texte: [
      'Sur le camp, on soigne comme au Moyen Âge : plantes, onguents et remèdes de la maison, avec les objets et les gestes qui vont avec. Le public découvre ce que l’on savait, ce que l’on croyait, et ce qui a survécu jusqu’à nous.',
      'Le module se prête aux échanges avec les familles et corrige quelques idées reçues sur l’hygiène et les soins médiévaux.'
    ],
    points: ['Plantes, remèdes et soins du quotidien', 'Savoirs et croyances de l’époque', 'Idées reçues sur la médecine médiévale']
  },
  {
    id: 'jeux',
    categorie: 'camp',
    img: 'assets/img/ateliers/ateliers-jeux.webp',
    alt: 'Deux plateaux de jeux peints sur toile, dont un jeu du moulin, avec des galets pour pions, posés sur une botte de paille',
    titre: 'Jeux de société',
    resume: 'Découverte de jeux historiques simples, rapides et participatifs.',
    texte: [
      'Des jeux de plateau, de stratégie ou d’adresse permettent aux visiteurs de s’installer quelques minutes et de partager une activité accessible. Les règles sont expliquées par un membre de l’association avant de laisser place à la partie.',
      'Ce module calme et participatif convient particulièrement aux familles. Il peut fonctionner en continu sur le camp ou prendre la forme de petits défis organisés pendant la journée.'
    ],
    points: ['Présentation des jeux et de leurs règles', 'Parties guidées pour petits et grands', 'Stratégie, hasard et sociabilité']
  },
  {
    id: 'escrime',
    categorie: 'armes',
    img: 'assets/img/ateliers/ateliers-escrime.webp',
    alt: 'Initiation encadrée autour des armes médiévales',
    titre: 'Initiation à l’escrime historique',
    resume: 'Enfants et adultes découvrent les rudiments de l’épée, en toute sécurité.',
    texte: [
      'Le public s’initie à l’art du combat tel que le décrivent les traités des maîtres d’armes : épée longue, dague, épée et bocle, combat en groupe avec bouclier. Une approche ludique et concrète, avec du matériel adapté et un encadrement permanent.',
      'L’initiation se fait en passages courts, pour que plusieurs groupes participent au fil de la journée, enfants comme adultes. Plusieurs membres de l’association pratiquent les arts martiaux historiques européens.'
    ],
    points: ['Consignes et gestes de base', 'Épée longue, dague, épée et bocle, bouclier', 'Petits groupes, matériel adapté à l’âge']
  },
  {
    id: 'duel-judiciaire',
    categorie: 'armes',
    img: 'assets/img/ateliers/ateliers-duel-judiciaire.webp',
    alt: 'Armes et armure utilisées pour une démonstration historique',
    titre: 'Duel judiciaire',
    resume: 'Un vrai duel à la touche, dans une lice fermée, avec les règles de l’époque.',
    texte: [
      'Ce n’est pas de l’escrime de spectacle : les combattants s’affrontent à la touche, dans une lice fermée et sécurisée, selon des règles qui existaient aux XIVe et XVe siècles. Un maréchal arbitre et explique au public le contexte : pourquoi un combat pouvait rendre la justice, chez les nobles comme dans le peuple.',
      'Les équipements varient d’un duel à l’autre : doublet, cotte de mailles, brigandine, armure. Un temps fort rarement présenté dans les fêtes médiévales, dont l’heure et la durée se calent sur votre programme.'
    ],
    points: ['Contexte juridique et règles du duel', 'Duel armuré et duel civil : ce qui change', 'Combat à la touche, arbitré et commenté']
  },
  {
    id: 'enfants-en-lice',
    categorie: 'armes',
    img: 'assets/img/ateliers/photo-a-venir.webp',
    alt: 'Photo à venir des combats d’enfants en lice',
    titre: 'Les enfants en lice',
    resume: 'Épées en mousse et boucliers : les enfants combattent à leur tour, dans la lice.',
    texte: [
      'Entre deux passages d’adultes, la lice revient aux enfants. Épées en mousse, boucliers à leur taille : le matériel est prévu pour eux, et un membre de l’association arbitre chaque combat du début à la fin.',
      'Les règles sont celles des grands, expliquées avant d’entrer : le salut, la garde, la touche. Les passages sont courts pour que tout le monde y vienne au fil de la journée, et les parents suivent depuis le bord de la lice.'
    ],
    points: ['Salut, garde et touche, comme chez les grands', 'Épées en mousse et boucliers adaptés à la taille', 'Passages courts et arbitrés, plusieurs fois dans la journée']
  },
  {
    id: 'archerie',
    categorie: 'armes',
    img: 'assets/img/ateliers/ateliers-archerie.webp',
    alt: 'Archer bandant un arc long devant le camp',
    titre: 'Archerie',
    resume: 'L’arc, les flèches et la puissance d’une arme simple en apparence.',
    texte: [
      'De l’arc à double courbure au long bow anglais, l’animation compare les matériaux, les formes et les usages, et explique pourquoi tant d’armées ont plié face aux archers. Le public découvre les différents types de flèches : pour chasser, percer une armure, ralentir un navire ou incendier un engin de siège.',
      'Selon le lieu et l’espace disponible, la présentation se prolonge par des tirs sur cible commentés par nos archers.'
    ],
    points: ['Arcs et flèches : matériaux, formes, usages', 'La place de l’archer dans les batailles', 'Tirs sur cible commentés, selon le lieu']
  },
  {
    id: 'forge',
    categorie: 'ateliers',
    img: 'assets/img/ateliers/ateliers-forge.webp',
    alt: 'Deux forgerons en costume devant la forge : enclume sur son billot, braises dans le foyer, soufflet et tenailles',
    titre: 'Forge',
    resume: 'Le travail du métal, les outils du forgeron et la fabrication des objets.',
    texte: [
      'Cette animation présente le métier du forgeron et les principales étapes nécessaires pour transformer le métal. Le public découvre le rôle du foyer, de l’enclume, du marteau et des différents outils utilisés pour chauffer, façonner et finir une pièce.',
      'La démonstration permet d’évoquer la place essentielle de la forge dans la vie quotidienne : outils agricoles, éléments de construction, objets domestiques et équipement militaire. Son déroulement est adapté au lieu et aux conditions de sécurité de l’événement.'
    ],
    points: ['Foyer, soufflet, enclume et marteaux', 'Chauffe et mise en forme du métal', 'Objets produits et rôle du forgeron']
  },
  {
    id: 'cotte-de-mailles',
    categorie: 'ateliers',
    img: 'assets/img/ateliers/photo-a-venir.webp',
    alt: 'Photo à venir',
    titre: 'Cotte de mailles',
    resume: 'Anneau après anneau : le public voit naître une protection et la soupèse.',
    texte: [
      'La cotte de mailles se fabrique anneau par anneau, à la pince, pendant des heures. L’atelier montre le geste, les outils et les motifs d’assemblage, et laisse le public essayer quelques anneaux.',
      'On y parle aussi du poids, du coût et de l’entretien de cette protection, et de ce qu’elle arrête ou n’arrête pas.'
    ],
    points: ['Outils et geste du mailleur', 'Motifs d’assemblage et solidité', 'Poids, coût et entretien']
  },
  {
    id: 'taille-de-pierre',
    categorie: 'ateliers',
    img: 'assets/img/ateliers/photo-a-venir.webp',
    alt: 'Photo à venir',
    titre: 'Taille de pierre',
    resume: 'Les outils et les gestes du tailleur de pierre, à voir de près.',
    texte: [
      'Le tailleur de pierre travaille au camp, au ciseau et à la massette : le public suit l’avancement d’une pièce au fil de la journée et découvre les outils, les traces qu’ils laissent et les marques des tailleurs.',
      'La démonstration fait le lien avec les monuments du lieu quand le site s’y prête : églises, remparts, châteaux.'
    ],
    points: ['Outils et traces d’outils', 'Du bloc brut à la pièce finie', 'Marques de tailleurs et chantiers médiévaux']
  },
  {
    id: 'fruits-legumes',
    categorie: 'camp',
    img: 'assets/img/ateliers/ateliers-fruits-legumes.webp',
    alt: 'Une cuisinière en coiffe blanche montre une carotte aux enfants devant sa table de légumes, d’herbes et de pots',
    titre: 'Fruits et légumes',
    resume: 'Produits disponibles, saisonnalité et alimentation au Moyen Âge.',
    texte: [
      'Cette animation invite le public à découvrir les fruits et légumes connus et consommés au Moyen Âge. Elle permet de distinguer les produits locaux, les aliments réservés à certaines régions ou catégories sociales, et ceux qui n’arriveront en Europe que plus tard.',
      'La présentation aborde également la saisonnalité, les modes de conservation et la place des végétaux dans les repas. Elle offre un point de comparaison concret avec notre alimentation actuelle et se prête particulièrement bien aux échanges avec les familles et les scolaires.'
    ],
    points: ['Fruits et légumes présents au Moyen Âge', 'Saisons, cultures et conservation', 'Idées reçues sur l’alimentation médiévale']
  },
  {
    id: 'defile',
    categorie: 'camp',
    img: 'assets/img/ateliers/photo-a-venir.webp',
    alt: 'Photo à venir',
    titre: 'Défilé en costumes',
    resume: 'La mesnie défile avec sa bannière, aux côtés des autres troupes.',
    texte: [
      'Pour ouvrir ou clore une fête médiévale, la mesnie défile en costumes, bannière en tête, avec les autres troupes présentes. Un moment visible qui annonce le camp aux visiteurs.',
      'Le défilé se cale sur votre programme ; il est inclus dans nos interventions sur un week-end.'
    ],
    points: ['Cortège en costumes avec la bannière', 'Ouverture ou clôture de la fête', 'Placé à l’heure de votre programme']
  }
];
