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
//   texte : FACULTATIF — ce qui s'ajoute encore sous l'atelier. Une phrase,
//           ou un tableau de paragraphes :
//           texte: ['Premier paragraphe.', 'Second paragraphe.']
window.EC_PERSONNAGES = [
  {img:'assets/img/personnages/personnages-aimar.webp', name:'Aimar', siecle:15, epoqueAffichee:true, epoque:'Fin XIVe – début XVe siècle', lieu:'Vallée du Rhône / Provence', role:'Arbalétrier', hook:'Un carreau, une cible, une seule chance : il prend son temps pour viser, jamais pour tirer.', alt:'Aimar, arbalétrier, chaperon bleu à dents, brigandine cloutée, l’arbalète sur l’épaule', atelier:'Armes et armures'},
  {img:'assets/img/personnages/personnages-frederic.webp', name:'Frédéric', siecle:15, epoqueAffichee:true, epoque:'Seconde moitié du XVe siècle', lieu:'Europe', role:'Forgeron', hook:'Il bat le fer tant qu’il est chaud. Approchez sans crainte : c’est l’enclume qui prend les coups.', alt:'Frédéric, forgeron, en pourpoint violet et bonnet noir, la main sur une hampe', atelier:'Forge'},
  {img:'assets/img/personnages/personnages-perrette.webp', name:'Perrette', siecle:14, epoqueAffichee:true, epoque:'Seconde moitié du XIVe siècle', lieu:'Europe', role:'Bugadière et tisserande', hook:'La lessive à la cendre avec un seau percé… quel travail pour un petit bout de galon !', alt:'Perrette, tisserande, en chaperon rayé devant son petit métier à galon'},
  {img:'assets/img/personnages/personnages-doriane.webp', name:'Doriane', siecle:14, epoqueAffichee:true, lieu:'Europe', role:'Tisserande', hook:'Fil après fil, elle tisse ses galons en souriant — même quand le fil casse. Surtout quand le fil casse.', alt:'Doriane, tisserande, en chaperon rouge doublé de bleu, derrière son petit métier à galon', atelier:'Textile et tissage'},
  {img:'assets/img/personnages/personnages-kilian.webp', name:'Kilian', siecle:14, epoqueAffichee:true, epoque:'Seconde moitié du XIVe siècle', lieu:'Europe', role:'Chevalier', hook:'Chevalier de son état, il relève tous les défis — surtout ceux lancés par des adversaires d’un mètre vingt.', alt:'Kilian, chevalier, en pourpoint mi-parti bleu et rouge', atelier:'Les enfants en lice'},
  {img:'assets/img/personnages/personnages-childeric.webp', name:'Childéric', siecle:13, epoqueAffichee:true, epoque:'Fin XIIIe siècle', lieu:'Europe', role:'Maître d’armes', hook:'L’art de l’épée ? Croiser le fer, puis porter l’estoc ou la taille.', alt:'Childéric, maître d’armes, en tunique bleue à côté d’une armure et d’un écu vert et blanc', atelier:['Duel judiciaire', 'Armes et armures', 'Initiation à l’escrime historique', 'Archerie']},
  {img:'assets/img/personnages/personnages-guillaume.webp', name:'Guillaume', siecle:13, epoqueAffichee:true, lieu:'Europe', role:'Cuisinier', hook:'Écuelles alignées, gobelet en main : il vous sert le repas du camp, pourvu que vous n’arriviez pas après lui.', alt:'Guillaume, cuisinier, en cotte verte, attablé devant ses écuelles et gobelets de bois, une tente derrière lui', atelier:'Cuisine au feu'},

  {img:'assets/img/personnages/personnages-thibault-le-jeune.webp', name:'Thibault le jeune', siecle:11, epoqueAffichee:true, lieu:'Europe', role:'Apprenti arbalétrier', hook:'Il s’adonne à l’arbalestrie. Mieux vaut, pour l’instant, protéger vos têtes.', alt:'Thibault le jeune, chaperon rouge et cale blanche, devant une tente'},
  {img:'assets/img/personnages/personnages-angelique.webp', name:'Angélique', siecle:13, epoqueAffichee:true, lieu:'Europe', role:'Cuisinière', hook:'Une faim de loup ou le nez qui coule, dans les deux cas, elle a ce qu’il vous faut !', alt:'Angélique, cuisinière, en voile et guimpe de lin, derrière sa table de chaudrons de cuivre, mortier et pots d’herbes', atelier:'découverte des épices et des plantes médicinales'},
  {img:'assets/img/personnages/personnages-ecarlate.webp', name:'Sire l’Écarlate', siecle:14, epoqueAffichee:true, lieu:'Europe', role:'Archer et cracheur de feu', hook:'Toujours prêt à échanger quelques coups d’épée. La nuit venue, il s’embrase de mille feux.', alt:'Sire l’Écarlate, chapeau à coquille et lunettes de corne, à son écritoire'},
  {img:'assets/img/personnages/personnages-christelle.webp', name:'Christelle', siecle:15, epoqueAffichee:true, lieu:'Europe', role:'Médecin', hook:'Une saignée, trois herbes et beaucoup de prières : vous sortirez guéri… ou du moins convaincu de l’être.', alt:'Christelle, en coiffe blanche, cape noire et cotte verte, sous la tente derrière sa table de livres et d’herbiers', atelier:'Médecine'},
  {img:'assets/img/personnages/personnages-eric.webp', name:'Eric', siecle:15, epoqueAffichee:true, lieu:'Europe', role:'Bourreau', hook:'Ne vous fiez pas à son air avenant : coupable ou simple suspect, il ne versera pas une larme.', alt:'Eric, le bourreau, chaperon noir à l’insigne de corde, cape de laine et hache à la main', atelier:'Bourreau'},
  {img:'assets/img/personnages/personnages-morgane.webp', name:'Morgane', siecle:15, epoqueAffichee:true, epoque:'Fin XVe siècle', lieu:'Europe', role:'Fille du bourreau', hook:'Son père coupe les têtes ; elle, elle les fait tourner. Et contre elle, on n’a même pas le droit de faire appel.', alt:'Morgane, fille du bourreau, chapeau de paille et chemise blanche, devant une tente rose et noire', atelier:'Bourreau'},
  {img:'assets/img/personnages/personnages-bougonne.webp', name:'La Bougonne', siecle:15, epoqueAffichee:true, epoque:'Fin XVe siècle', lieu:'Italie', role:'Tailleuse de pierre', hook:'Rieuse ou grognon ? Envoyez donc quelqu’un d’autre tâter son humeur.', alt:'La Bougonne, en robe bleue et coiffe blanche, riant aux éclats, assise près de la table du camp', atelier:'Taille de pierre'},

  {img:'assets/img/personnages/personnages-benoit.webp', name:'Benoît', siecle:15, epoqueAffichee:false, role:'Enlumineur', hook:'Un pinceau, trois pigments et une patience d’ange : il fait briller l’or sur le parchemin… et sur votre blason, si vous êtes sage.', alt:'Benoît, enlumineur, en chemise blanche et gilet noir, pinceau à la main devant ses pigments et un blason peint', atelier:'Écriture et pigments'},
  {img:'assets/img/personnages/personnages-nathalie.webp', name:'Nathalie', siecle:13, epoqueAffichee:false, role:'Blasonnière', hook:'Donnez-lui votre nom, elle vous rendra un blason. Pour la devise, il faudra la mériter.', alt:'Nathalie, blasonnière, en robe bleue devant un vieil olivier', atelier:'Héraldique'},
  {img:'assets/img/personnages/personnages-denis.webp', name:'Denis', siecle:13, epoqueAffichee:false, role:'Haubergier', hook:'Des milliers d’anneaux, un par un : sa patience est à toute épreuve, et sa cotte de mailles aussi.', alt:'Denis, haubergier, assis en tunique blanche à croix rouge et bonnet noir', atelier:'Cotte de mailles'},
  {img:'assets/img/personnages/personnages-melynn.webp', name:'Melynn', siecle:15, epoqueAffichee:false, role:'Écuyère', hook:'Écuyère des chevaliers en herbe : elle tend les épées, compte les touches, et ne laisse rien passer.', alt:'Melynn, écuyère, en robe verte, des épées de mousse sur l’épaule', atelier:'Les enfants en lice'},
  {img:'assets/img/personnages/personnages-joshua.webp', name:'Joshua', siecle:13, epoqueAffichee:false, role:'Peintre de cour', hook:'Laissez le tracé de son pinceau immortaliser vos plus grands succès… ou vos plus grands embarras. Au choix.', alt:'Joshua, peintre de cour, devant sa feuille de parchemin', atelier:'illustration et fabrication de peintures médiévales'},
  {img:'assets/img/personnages/personnages-ambre.webp', name:'Ambre', siecle:13, epoqueAffichee:false, role:'Acrobate', hook:'Virevoltante et espiègle, elle se plaît à faire des farces aux voyageurs de passage.', alt:'Ambre, acrobate, bonnet pointu de feutre et cape sombre, sourire malicieux, à côté de la bannière de la troupe'}
];
