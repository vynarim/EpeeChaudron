/* Déposé en www/v2/sw.js, à la place du service worker de l'ancienne recette.
 *
 * Les membres qui ont ouvert https://epee-chaudron.fr/v2/ gardent un service
 * worker inscrit sur /v2/. À leur prochain passage, le navigateur récupère ce
 * fichier-ci comme mise à jour : il se désinscrit et renvoie la page vers la
 * racine du site. Il ne vide aucun cache : la racine partage la même origine,
 * et son propre service worker fait le ménage.
 *
 * Le .htaccess de la racine redirige tout /v2/ vers / sauf ce fichier. Il peut
 * être supprimé du serveur dans quelques mois, avec cette exception.
 */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.registration.unregister();
    const fenetres = await self.clients.matchAll({type: 'window'});
    fenetres.forEach(fenetre => fenetre.navigate('/'));
  })());
});
