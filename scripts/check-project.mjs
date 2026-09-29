import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'assets/css/style.css',
  'assets/js/main.js',
  'assets/js/photos.js',
  'assets/js/personnages.js',
  'assets/img/logo-square.webp',
  'assets/img/icons/favicon-96.png',
  'assets/img/icons/apple-touch-icon.png'
];

let errors = [];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Fichier manquant: ${file}`);
}

const htmlPath = path.join(root, 'index.html');
const cssPath = path.join(root, 'assets/css/style.css');
const photosPath = path.join(root, 'assets/js/photos.js');
const personnagesPath = path.join(root, 'assets/js/personnages.js');
const mainPath = path.join(root, 'assets/js/main.js');
const manifestPath = path.join(root, 'manifest.webmanifest');

const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
const photos = fs.existsSync(photosPath) ? fs.readFileSync(photosPath, 'utf8') : '';
const personnages = fs.existsSync(personnagesPath) ? fs.readFileSync(personnagesPath, 'utf8') : '';
const main = fs.existsSync(mainPath) ? fs.readFileSync(mainPath, 'utf8') : '';

if (!html.includes('name="viewport"')) errors.push('Viewport mobile manquant dans index.html');
if (!html.includes('data-gallery-grid')) errors.push('Conteneur galerie manquant');
if (!html.includes('data-persona-track')) errors.push('Conteneur personnages manquant');
if (!html.includes('data-persona-modal')) errors.push('Fiche personnage manquante');
if (!css.includes('@media (max-width:620px)')) errors.push('Breakpoint mobile 620px manquant');
if (!photos.includes('window.EC_PHOTOS')) errors.push('Définition window.EC_PHOTOS manquante');
if (!personnages.includes('window.EC_PERSONNAGES')) errors.push('Définition window.EC_PERSONNAGES manquante');

// Application installable : les trois pièces doivent rester solidaires.
if (!html.includes('rel="manifest"')) errors.push('index.html ne déclare pas le manifeste');
if (!/rel="manifest"[^>]*crossorigin="use-credentials"/.test(html)) {
  errors.push('Le manifeste doit être déclaré avec crossorigin="use-credentials", sinon le répertoire protégé par mot de passe le refuse et l’installation échoue');
}
if (!html.includes('rel="apple-touch-icon"')) errors.push('index.html ne déclare pas l’icône iOS');
if (!html.includes('name="theme-color"')) errors.push('Couleur de thème manquante dans index.html');
if (!main.includes("serviceWorker")) errors.push('main.js n’enregistre pas le service worker');

if (fs.existsSync(manifestPath)) {
  let manifest = null;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    errors.push(`manifest.webmanifest illisible: ${err.message}`);
  }
  if (manifest) {
    for (const champ of ['name', 'short_name', 'description', 'start_url', 'scope', 'display', 'theme_color', 'background_color', 'icons']) {
      if (!manifest[champ]) errors.push(`manifest.webmanifest: champ « ${champ} » manquant`);
    }
    const tailles = (manifest.icons || []).map(icone => icone.sizes);
    for (const taille of ['192x192', '512x512']) {
      if (!tailles.includes(taille)) errors.push(`manifest.webmanifest: icône ${taille} manquante (exigée pour l’installation)`);
    }
    if (!(manifest.icons || []).some(icone => (icone.purpose || '').includes('maskable'))) {
      errors.push('manifest.webmanifest: aucune icône « maskable » (l’icône serait rognée sur Android)');
    }
    const declares = [...(manifest.icons || []), ...(manifest.screenshots || [])];
    for (const entree of declares) {
      if (entree.src && !fs.existsSync(path.join(root, entree.src))) {
        errors.push(`Image déclarée dans le manifeste mais absente: ${entree.src}`);
      }
    }
  }
}

const imageRefs = [...html.matchAll(/(?:src|href)="(assets\/img\/[^"]+)"/g)].map(m => m[1]);
for (const ref of imageRefs) {
  if (!fs.existsSync(path.join(root, ref))) errors.push(`Image référencée absente: ${ref}`);
}

const photoImageRefs = [...photos.matchAll(/(?:src|thumb):'([^']+)'/g)].map(m => m[1]);
for (const ref of photoImageRefs) {
  if (!fs.existsSync(path.join(root, ref))) errors.push(`Image de galerie absente: ${ref}`);
}

// Les portraits : un personnage qui quitte la compagnie emporte sa photo, et
// l'entrée oubliée pointerait alors dans le vide sans que rien ne le signale.
const portraitRefs = [...personnages.matchAll(/img:'([^']+)'/g)].map(m => m[1]);
for (const ref of portraitRefs) {
  if (!fs.existsSync(path.join(root, ref))) errors.push(`Portrait de personnage absent: ${ref}`);
}

if (errors.length) {
  console.error('Vérification échouée:');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log('Vérification OK. Projet cohérent.');
