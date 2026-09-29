// Personnages de la mesnie, dans l'ordre d'affichage du carrousel.
// Pour en ajouter un : déposer son portrait (vertical, format 3/4) dans
// assets/img/personnages/ puis ajouter une ligne ici. Rien d'autre à modifier.
//   img  : chemin du portrait
//   name : nom affiché
//   role : rôle affiché sous le nom
//   hook : accroche d'une phrase, en italique sur la carte
//   alt  : description de la photo pour les lecteurs d'écran
//   texte : FACULTATIF — ce qui s'ajoute sous l'accroche dans la fiche
//           plein écran. Une phrase, ou un tableau de paragraphes :
//           texte: ['Premier paragraphe.', 'Second paragraphe.']
window.EC_PERSONNAGES = [
  {img:'assets/img/personnages/personnages-thibault.webp', name:'Thibault', role:'Bourreau', hook:'Ne vous fiez pas à son air avenant : coupable ou simple suspect, il ne versera pas une larme.', alt:'Thibault, le bourreau, bonnet rouge et plastron de cuir'},
  {img:'assets/img/personnages/personnages-margot.webp', name:'Dame Margot', role:'Cuisinière', hook:'À quand la prochaine ripaille ? Quand les chasseurs cesseront de rentrer bredouilles !', alt:'Dame Margot goûtant un plat à la cuillère'},
  {img:'assets/img/personnages/personnages-morgane.webp', name:'Morgane', role:'Saltimbanque', hook:'Diabolo, bras de fer ou tir à la corde : gare à qui la prend pour une fillette.', alt:'Morgane, jeune saltimbanque au bandeau de cuir'},
  {img:'assets/img/personnages/personnages-ambre.webp', name:'Ambre', role:'Acrobate', hook:'Virevoltante et espiègle, elle se plaît à faire des farces aux voyageurs de passage.', alt:'Ambre, la cadette, acrobate'},
  {img:'assets/img/personnages/personnages-childeric.webp', name:'Childéric', role:'Maître d’armes', hook:'L’art de l’épée ? Croiser le fer, puis porter l’estoc ou la taille.', alt:'Childéric, maître d’armes'},
  {img:'assets/img/personnages/personnages-perrette.webp', name:'Perrette', role:'Bugadière et tisserande', hook:'La lessive à la cendre avec un seau percé… quel travail pour un petit bout de galon !', alt:'Perrette, bugadière, à la lessive'},
  {img:'assets/img/personnages/personnages-thibault-le-jeune.webp', name:'Thibault le jeune', role:'Apprenti arbalétrier', hook:'Il s’adonne à l’arbalestrie. Mieux vaut, pour l’instant, protéger vos têtes.', alt:'Thibault le jeune, apprenti arbalétrier'},
  {img:'assets/img/personnages/personnages-ecarlate.webp', name:'Sire l’Écarlate', role:'Archer et cracheur de feu', hook:'Toujours prêt à échanger quelques coups d’épée. La nuit venue, il s’embrase de mille feux.', alt:'Sire l’Écarlate, archer'},
  {img:'assets/img/personnages/personnages-bougonne.webp', name:'La Bougonne', role:'Tisserande', hook:'Rieuse ou grognon ? Envoyez donc quelqu’un d’autre tâter son humeur.', alt:'La Bougonne, tisserande'},
  {img:'assets/img/personnages/personnages-joshua.webp', name:'Joshua', role:'Peintre de cour', hook:'Laissez le tracé de son pinceau immortaliser vos plus grands succès… ou vos plus grands embarras. Au choix.', alt:'Joshua, peintre de cour, devant sa feuille de parchemin', texte:'Atelier : illustration et fabrication de peintures médiévales.'}
];
