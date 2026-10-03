// Personnages de la mesnie, dans l'ordre d'affichage du carrousel : d'abord les
// costumes affichés tels quels, puis ceux qui ont une pièce à revoir, enfin ceux
// dont l'époque ne s'affiche pas (voir costumes/analyse.json).
// Pour en ajouter un : déposer son portrait (vertical, format 3/4) dans
// assets/img/personnages/ puis ajouter une ligne ici. Rien d'autre à modifier,
// sinon analyser son costume : npm run check le rappelle (voir plus bas).
//   img  : chemin du portrait
//   name : nom affiché
//   role : rôle affiché sous le nom
//   hook : accroche d'une phrase, en italique sur la carte
//   alt  : description de la photo pour les lecteurs d'écran
//   atelier : FACULTATIF — l'atelier qu'anime le personnage. Affiché dans la
//             fiche plein écran, précédé de « Atelier : » en gras ; ne pas
//             réécrire ce mot ici. Écrit exactement comme le titre d'une
//             animation de ateliers.js, il devient un lien vers sa fiche.
//             Plusieurs ateliers : une liste, affichée après « Ateliers : »
//             atelier: ['Duel judiciaire', 'Archerie']
//   epoqueAffichee : true ou false — le costume est-il assez historique pour
//            qu'on dise d'où il vient ? À true, une ligne discrète s'affiche
//            sous l'accroche, sur la carte et dans la fiche : l'époque
//            (« XVe siècle », tirée de siecle, si epoque n'est pas renseigné)
//            et le lieu. À false, rien.
//   siecle : de 11 à 15 — le siècle que représente le costume. Obligatoire
//            quand epoqueAffichee est true (npm run check le vérifie).
//   epoque, lieu : précisent cette ligne :
//                  epoque:'Fin XIVe – début XVe siècle', lieu:'Vallée du Rhône / Provence'
//   Ces quatre champs viennent de l'analyse des costumes, costumes/analyse.json :
//   corriger l'analyse, puis « npm run costumes -- appliquer » les recopie ici.
//   Deux entrées du même nom : un membre, deux costumes. Le carrousel n'en
//   fait qu'une carte, où les costumes se relaient ; chaque costume garde sa
//   fiche complète. Leur donner les mêmes ateliers.
//   texte : FACULTATIF — ce qui s'ajoute encore sous l'atelier. Une phrase,
//           ou un tableau de paragraphes :
//           texte: ['Premier paragraphe.', 'Second paragraphe.']
window.EC_PERSONNAGES = [
  {img:'assets/img/personnages/personnages-aimar.webp', name:'Aimar', siecle:15, epoqueAffichee:true, epoque:'Fin XIVe – début XVe siècle', lieu:'Vallée du Rhône / Provence', role:'Arbalétrier', hook:'Un carreau, une cible, une seule chance : il prend son temps pour viser, jamais pour tirer.', alt:'Aimar, arbalétrier, chaperon bleu à dents, brigandine cloutée, l’arbalète sur l’épaule', atelier:'Armes et armures'},
  {img:'assets/img/personnages/personnages-frederic.webp', name:'Frédéric', siecle:15, epoqueAffichee:true, epoque:'Seconde moitié du XVe siècle', lieu:'Europe', role:'Forgeron', hook:'Il bat le fer tant qu’il est chaud. Approchez sans crainte : c’est l’enclume qui prend les coups.', alt:'Frédéric, forgeron, en pourpoint violet et bonnet noir, la main sur une hampe', atelier:'Forge'},
  {img:'assets/img/personnages/personnages-frederic-forge.webp', name:'Frédéric', siecle:13, epoqueAffichee:true, lieu:'Europe', role:'Forgeron', hook:'Chapeau de paille et marteau en main : il forge des roses pour les dames, et des clous pour tout le reste.', alt:'Frédéric, forgeron, en cotte brune et chapeau de paille, une rose de fer forgé à la main, à côté de son enclume', atelier:'Forge'},
  {img:'assets/img/personnages/personnages-perrette.webp', name:'Perrette', siecle:14, epoqueAffichee:true, epoque:'Seconde moitié du XIVe siècle', lieu:'Europe', role:'Bugadière et tisserande', hook:'La lessive à la cendre avec un seau percé… quel travail pour un petit bout de galon !', alt:'Perrette, tisserande, en chaperon rayé devant son petit métier à galon', atelier:['Cuisine au feu', 'Fruits et légumes', 'Lessive à la cendre']},
  {img:'assets/img/personnages/personnages-doriane.webp', name:'Doriane', siecle:14, epoqueAffichee:true, lieu:'Europe', role:'Tisserande', hook:'Fil après fil, elle tisse ses galons en souriant — même quand le fil casse. Surtout quand le fil casse.', alt:'Doriane, tisserande, en chaperon rouge doublé de bleu, derrière son petit métier à galon', atelier:'Textile et tissage'},
  {img:'assets/img/personnages/personnages-kilian.webp', name:'Kilian', siecle:14, epoqueAffichee:true, epoque:'Seconde moitié du XIVe siècle', lieu:'Europe', role:'Chevalier', hook:'Chevalier de son état, il relève tous les défis — surtout ceux lancés par des adversaires d’un mètre vingt.', alt:'Kilian, chevalier, en pourpoint mi-parti bleu et rouge', atelier:'Les enfants en lice'},
  {img:'assets/img/personnages/personnages-childeric.webp', name:'Childéric', siecle:13, epoqueAffichee:true, epoque:'Fin XIIIe siècle', lieu:'Europe', role:'Maître d’armes', hook:'L’art de l’épée ? Croiser le fer, puis porter l’estoc ou la taille.', alt:'Childéric, maître d’armes, en tunique bleue à côté d’une armure et d’un écu vert et blanc', atelier:['Duel judiciaire', 'Armes et armures', 'Initiation à l’escrime historique', 'Archerie']},
  {img:'assets/img/personnages/personnages-childeric-archer.webp', name:'Childéric', siecle:14, epoqueAffichee:true, epoque:'Seconde moitié du XIVe siècle', lieu:'Europe', role:'Archer', hook:'Des lunettes pour mieux viser : la cible n’a qu’à bien se tenir… et vous, à rester derrière lui.', alt:'Childéric, archer, chaperon bleu à bord découpé, lunettes à rivet, cotte boutonnée et ceinture à plaques, des flèches à la ceinture', atelier:['Duel judiciaire', 'Armes et armures', 'Initiation à l’escrime historique', 'Archerie']},
  {img:'assets/img/personnages/personnages-guillaume.webp', name:'Guillaume', siecle:13, epoqueAffichee:true, lieu:'Europe', role:'Cuisinier', hook:'Écuelles alignées, gobelet en main : il vous sert le repas du camp, pourvu que vous n’arriviez pas après lui.', alt:'Guillaume, cuisinier, en cotte verte, attablé devant ses écuelles et gobelets de bois, une tente derrière lui', atelier:'Cuisine au feu'},

  {img:'assets/img/personnages/personnages-thibault-le-jeune.webp', name:'Thibault le jeune', siecle:11, epoqueAffichee:true, lieu:'Europe', role:'Apprenti arbalétrier', hook:'Il s’adonne à l’arbalestrie. Mieux vaut, pour l’instant, protéger vos têtes.', alt:'Thibault le jeune, chaperon rouge et cale blanche, devant une tente', atelier:'Jeux de société'},
  {img:'assets/img/personnages/personnages-angelique.webp', name:'Angélique', siecle:13, epoqueAffichee:true, lieu:'Europe', role:'Cuisinière', hook:'Une faim de loup ou le nez qui coule, dans les deux cas, elle a ce qu’il vous faut !', alt:'Angélique, cuisinière, en voile et guimpe de lin, derrière sa table de chaudrons de cuivre, mortier et pots d’herbes', atelier:['Cuisine au feu', 'découverte des épices et des plantes médicinales']},
  {img:'assets/img/personnages/personnages-ecarlate.webp', name:'Sire l’Écarlate', siecle:14, epoqueAffichee:true, lieu:'Europe', role:'Archer et cracheur de feu', hook:'Toujours prêt à échanger quelques coups d’épée. La nuit venue, il s’embrase de mille feux.', alt:'Sire l’Écarlate, chapeau à coquille et lunettes de corne, à son écritoire', atelier:['Écriture et pigments', 'Archerie']},
  {img:'assets/img/personnages/personnages-christelle.webp', name:'Christelle', siecle:15, epoqueAffichee:true, lieu:'Europe', role:'Médecin', hook:'Une saignée, trois herbes et beaucoup de prières : vous sortirez guéri… ou du moins convaincu de l’être.', alt:'Christelle, en coiffe blanche, cape noire et cotte verte, sous la tente derrière sa table de livres et d’herbiers', atelier:'Médecine'},
  {img:'assets/img/personnages/personnages-eric.webp', name:'Eric', siecle:15, epoqueAffichee:true, lieu:'Europe', role:'Bourreau', hook:'Ne vous fiez pas à son air avenant : coupable ou simple suspect, il ne versera pas une larme.', alt:'Eric, le bourreau, chaperon noir à l’insigne de corde, cape de laine et hache à la main', atelier:'Bourreau'},
  {img:'assets/img/personnages/personnages-morgane.webp', name:'Morgane', siecle:15, epoqueAffichee:true, epoque:'Fin XVe siècle', lieu:'Europe', role:'Fille du bourreau', hook:'Son père coupe les têtes ; elle, elle les fait tourner. Et contre elle, on n’a même pas le droit de faire appel.', alt:'Morgane, fille du bourreau, chapeau de paille et chemise blanche, devant une tente rose et noire', atelier:'Bourreau'},
  {img:'assets/img/personnages/personnages-bougonne.webp', name:'La Bougonne', siecle:15, epoqueAffichee:true, epoque:'Fin XVe siècle', lieu:'Italie', role:'Tailleuse de pierre', hook:'Rieuse ou grognon ? Envoyez donc quelqu’un d’autre tâter son humeur.', alt:'La Bougonne, en robe bleue et coiffe blanche, riant aux éclats, assise près de la table du camp', atelier:['Taille de pierre', 'Archerie']},

  {img:'assets/img/personnages/personnages-benoit.webp', name:'Benoît', siecle:15, epoqueAffichee:false, role:'Enlumineur', hook:'Un pinceau, trois pigments et une patience d’ange : il fait briller l’or sur le parchemin… et sur votre blason, si vous êtes sage.', alt:'Benoît, enlumineur, en chemise blanche et gilet noir, pinceau à la main devant ses pigments et un blason peint', atelier:'Écriture et pigments'},
  {img:'assets/img/personnages/personnages-nathalie.webp', name:'Nathalie', siecle:13, epoqueAffichee:false, role:'Blasonnière', hook:'Donnez-lui votre nom, elle vous rendra un blason. Pour la devise, il faudra la mériter.', alt:'Nathalie, blasonnière, en robe bleue devant un vieil olivier', atelier:'Héraldique'},
  {img:'assets/img/personnages/personnages-denis.webp', name:'Denis', siecle:13, epoqueAffichee:false, role:'Haubergier', hook:'Des milliers d’anneaux, un par un : sa patience est à toute épreuve, et sa cotte de mailles aussi.', alt:'Denis, haubergier, assis en tunique blanche à croix rouge et bonnet noir', atelier:'Cotte de mailles'},
  {img:'assets/img/personnages/personnages-melynn.webp', name:'Melynn', siecle:15, epoqueAffichee:false, role:'Écuyère', hook:'Écuyère des chevaliers en herbe : elle tend les épées, compte les touches, et ne laisse rien passer.', alt:'Melynn, écuyère, en robe verte, des épées de mousse sur l’épaule', atelier:'Les enfants en lice'},
  {img:'assets/img/personnages/personnages-joshua.webp', name:'Joshua', siecle:13, epoqueAffichee:false, role:'Peintre de cour', hook:'Laissez le tracé de son pinceau immortaliser vos plus grands succès… ou vos plus grands embarras. Au choix.', alt:'Joshua, peintre de cour, devant sa feuille de parchemin', atelier:['Écriture et pigments', 'illustration et fabrication de peintures médiévales']},
  {img:'assets/img/personnages/personnages-portrait-a-venir.webp', name:'Dimitri', epoqueAffichee:false, role:'Souillard', hook:'Pots, chaudrons, écuelles : tout passe entre ses mains et ressort brillant… tout, sauf lui.', alt:'Portrait de Dimitri, souillard, à venir', atelier:['Cuisine au feu', 'Les enfants en lice']},
  {img:'assets/img/personnages/personnages-ambre.webp', name:'Ambre', siecle:13, epoqueAffichee:false, role:'Acrobate', hook:'Virevoltante et espiègle, elle se plaît à faire des farces aux voyageurs de passage.', alt:'Ambre, acrobate, bonnet pointu de feutre et cape sombre, sourire malicieux, à côté de la bannière de la troupe'}
];

// Le métier à l'époque : une ou deux phrases de remise en contexte, affichées
// dans la fiche entre le rôle et le nom. Une entrée par rôle de la liste
// ci-dessus, écrite exactement comme lui ; un rôle sans entrée n'affiche rien.
window.EC_METIERS = {
  'Arbalétrier': 'Soldat de métier, engagé et payé à la solde. L’arbalète perçait les armures et s’apprenait vite, mais coûtait cher : les arbalétriers génois étaient recherchés dans toute l’Europe.',
  'Apprenti arbalétrier': 'Les villes entretenaient des compagnies d’arbalétriers qui s’exerçaient au tir chaque dimanche. Un jeune y apprenait le tir et l’entretien de l’arme auprès des anciens.',
  'Forgeron': 'Artisan indispensable, au village comme en ville : outils des champs, fers des chevaux, clous, ferrures. Un métier respecté, organisé en corporation dans les villes.',
  'Bugadière et tisserande': 'La bugadière faisait la « bugade », la grande lessive à la cendre, deux ou trois fois l’an : un travail pénible, payé à la journée. Le tissage occupait les femmes dans presque chaque foyer.',
  'Tisserande': 'Le tissage occupait les femmes dans presque chaque foyer. En ville, certaines travaillaient pour des marchands ; à Paris, des métiers de la soie étaient même réservés aux femmes.',
  'Chevalier': 'Guerrier à cheval, lié à un seigneur par l’hommage. Cheval, armure et écuyers coûtaient une fortune : la chevalerie était un état, un idéal autant qu’un métier des armes.',
  'Maître d’armes': 'Il enseignait l’escrime contre paiement, aux nobles comme aux bourgeois. Son savoir nous est parvenu par des traités, comme celui de Fiore dei Liberi vers 1400.',
  'Archer': 'Fantassin souvent issu du peuple, milicien des villes ou soldat payé. Entraînés dès l’enfance, les archers anglais ont décidé de grandes batailles de la guerre de Cent Ans.',
  'Archer et cracheur de feu': 'L’archer était un fantassin souvent issu du peuple. Le cracheur de feu appartient aux bateleurs, ces amuseurs itinérants des foires qui jouaient avec le feu pour étonner la foule.',
  'Cuisinier': 'Dans les grandes maisons, la cuisine était une petite armée sous les ordres du queux. Un bon cuisinier était recherché : Taillevent, queux de Charles V, a laissé un livre de recettes célèbre.',
  'Cuisinière': 'Au foyer, la cuisine revenait aux femmes ; dans les grandes maisons, à une brigade d’hommes menée par le queux. Une bonne cuisinière était précieuse dans les maisons bourgeoises.',
  'Médecin': 'Le médecin, formé à l’université, examinait les urines et consultait les astres ; barbiers et chirurgiens soignaient de la main. Des femmes soignaient aussi, parfois poursuivies pour cela.',
  'Bourreau': 'Officier de justice payé par la ville ou le seigneur, il appliquait les peines. Indispensable mais tenu à l’écart : on évitait de le toucher, et la charge passait souvent de père en fils.',
  'Fille du bourreau': 'La famille du bourreau vivait à l’écart, et ses enfants se mariaient souvent entre familles de bourreaux. La charge se transmettait ainsi d’une génération à l’autre.',
  'Tailleuse de pierre': 'Les tailleurs de pierre façonnaient les blocs des cathédrales et des châteaux, chacun signant sa pierre d’une marque pour être payé. Des femmes travaillaient aussi sur les chantiers.',
  'Enlumineur': 'Il ornait les manuscrits de lettrines, de miniatures et d’or. D’abord moines, les enlumineurs sont surtout, dès le XIIIe siècle, des artisans laïcs installés en ville, à Paris notamment.',
  'Blasonnière': 'Peindre les armoiries sur les écus, les bannières et les cottes d’armes était l’affaire des peintres. Un travail très demandé : au tournoi, chacun se reconnaissait à ses couleurs.',
  'Haubergier': 'Il fabriquait les hauberts, ces chemises faites de milliers d’anneaux rivetés. Des semaines de travail pour une pièce très chère, qu’on réparait plutôt que de la remplacer.',
  'Écuyère': 'L’écuyer servait un chevalier : il portait ses armes, soignait son cheval, l’aidait à s’armer. Pour un jeune noble, c’était l’apprentissage avant d’être adoubé.',
  'Peintre de cour': 'Attaché au service d’un prince, il peignait portraits, décors et bannières pour les fêtes. Une place très recherchée, avec gages et habits : Jan van Eyck l’occupa chez le duc de Bourgogne.',
  'Souillard': 'Le plus humble de la cuisine : il récurait chaudrons, broches et écuelles à la cendre et au sable. Une place de jeune garçon, première marche vers le métier de cuisinier.',
  'Acrobate': 'Bateleurs et jongleurs allaient de foire en château, mêlant acrobaties, musique et tours d’adresse. Applaudis du public mais mal vus de l’Église, ils vivaient de sa générosité.',
};
