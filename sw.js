/* Service worker de L’Épée et le Chaudron.
 *
 * Il n'a qu'un rôle : permettre au site de s'ouvrir sans réseau une fois qu'il
 * a été visité — utile sur une fête médiévale où la 4G ne passe pas toujours.
 *
 * Stratégie « réseau d'abord » partout, sans exception. La version en ligne
 * gagne toujours ; le cache n'est qu'un filet quand la connexion manque. C'est
 * ce qui permet de remplacer le portrait d'un personnage par un fichier du même
 * nom, ou de renvoyer le site en recette, sans que personne ne reste coincé sur
 * une ancienne version. Ne pas passer ce fichier en « cache d'abord » sans
 * prévoir en échange un vrai numéro de version sur chaque fichier.
 */

const VERSION = 'ec-2026-10-17b';

// Le strict nécessaire pour que la page s'affiche correctement hors ligne.
// Les deux photos du haut de page en font partie : au tout premier chargement,
// le service worker n'a pas encore la main quand le navigateur les demande, et
// sans ce pré-chargement le premier écran hors ligne serait amputé de sa photo.
// Les autres photos entrent au cache au fil de la visite.
const COQUILLE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/js/photos.js',
  './assets/js/personnages.js',
  './assets/js/ateliers.js',
  './assets/img/ecusson-epee-chaudron.webp',
  './assets/img/icons/favicon-32.png',
  './assets/img/full/accueil-troupe-camp.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      // Chaque fichier est mis en cache pour lui-même : un seul manquant ne
      // doit pas faire échouer l'installation entière.
      .then(cache => Promise.all(COQUILLE.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(noms => Promise.all(noms.filter(nom => nom !== VERSION).map(nom => caches.delete(nom))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const requete = event.request;
  if (requete.method !== 'GET') return;

  const url = new URL(requete.url);
  // Facebook, et tout ce qui n'est pas chez nous : on laisse passer sans s'en mêler.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(requete)
      .then(reponse => {
        // Une erreur serveur ne doit pas écraser une copie valable déjà en cache.
        if (reponse && reponse.ok && reponse.type === 'basic') {
          const copie = reponse.clone();
          event.waitUntil(caches.open(VERSION).then(cache => cache.put(requete, copie)));
        }
        return reponse;
      })
      .catch(() => caches.match(requete).then(enCache => {
        if (enCache) return enCache;
        // Deuxième chance en ignorant la chaîne de requête : une adresse
        // partagée sur Facebook revient souvent avec un ?fbclid=… collé au bout,
        // qui ne doit pas faire manquer la copie déjà en cache.
        return caches.match(requete, { ignoreSearch: true }).then(approchant => {
          if (approchant) return approchant;
          // Hors ligne sur une adresse jamais visitée : le site tient en une
          // seule page, on rend celle-là plutôt qu'une erreur.
          if (requete.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        });
      }))
  );
});
