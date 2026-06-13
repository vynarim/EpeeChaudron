import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'index.html',
  'assets/css/style.css',
  'assets/js/main.js',
  'assets/js/photos.js',
  'assets/img/favicon.png',
  'assets/img/logo-square.webp'
];

let errors = [];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Fichier manquant: ${file}`);
}

const htmlPath = path.join(root, 'index.html');
const cssPath = path.join(root, 'assets/css/style.css');
const photosPath = path.join(root, 'assets/js/photos.js');

const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
const photos = fs.existsSync(photosPath) ? fs.readFileSync(photosPath, 'utf8') : '';

if (!html.includes('name="viewport"')) errors.push('Viewport mobile manquant dans index.html');
if (!html.includes('data-gallery-grid')) errors.push('Conteneur galerie manquant');
if (!css.includes('@media (max-width:620px)')) errors.push('Breakpoint mobile 620px manquant');
if (!photos.includes('window.EC_PHOTOS')) errors.push('Définition window.EC_PHOTOS manquante');

const imageRefs = [...html.matchAll(/(?:src|href)="(assets\/img\/[^"]+)"/g)].map(m => m[1]);
for (const ref of imageRefs) {
  if (!fs.existsSync(path.join(root, ref))) errors.push(`Image référencée absente: ${ref}`);
}

const photoImageRefs = [...photos.matchAll(/(?:src|thumb):'([^']+)'/g)].map(m => m[1]);
for (const ref of photoImageRefs) {
  if (!fs.existsSync(path.join(root, ref))) errors.push(`Image de galerie absente: ${ref}`);
}

if (errors.length) {
  console.error('Vérification échouée:');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log('Vérification OK. Projet cohérent.');
