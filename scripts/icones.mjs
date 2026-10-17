// Fabrique le logo et toutes les icônes du site à partir de l'écusson de
// l'association, sources/ecusson-epee-chaudron.png (carré, 1254 × 1254).
//
// Comme scripts/portrait.mjs, c'est le navigateur (Edge ou Chrome) qui sert de
// moteur d'image, piloté par playwright-core. Rien de ce script ne part en
// ligne ; seuls les fichiers qu'il écrit dans assets/ y vont.
//
//   npm run icones
//
// Deux découpes :
//   - l'écusson entier, nom compris, pour l'illustration de la section
//     « Voir, toucher, comprendre » : à cette taille, le nom se lit ;
//   - l'emblème seul (l'épée et le chaudron, sous le bandeau du nom) pour
//     tout ce qui est petit ou arrondi par le téléphone : favicons, icônes
//     d'application, logo de l'en-tête. Réduit à 32 px, le nom ne serait plus
//     qu'un trait, et le masque rond d'Android le couperait. Voir
//     « Refabriquer les icônes » dans README_DEPLOIEMENT.md.
//
// Les petites tailles sont réduites par paliers successifs de moitié : une
// réduction directe de 1040 à 16 px donne une bouillie de pixels.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(RACINE, 'sources/ecusson-epee-chaudron.png');

// Zones en pixels de la source : x, y, côté du carré.
const ENTIER = [0, 0, 1254];
// Sous le bandeau du nom, jusqu'au bord intérieur du cadre : le pommeau de
// l'épée et les flammes du chaudron restent entiers.
const EMBLEME = [55, 185, 1040];

const FICHIERS = [
  { dst: 'assets/img/full/intro-ecusson-association.webp', zone: ENTIER, taille: 960, type: 'image/webp' },
  { dst: 'assets/img/logo-square.webp', zone: EMBLEME, taille: 96, type: 'image/webp' },
  { dst: 'assets/img/icons/icon-512.png', zone: EMBLEME, taille: 512, type: 'image/png' },
  { dst: 'assets/img/icons/icon-192.png', zone: EMBLEME, taille: 192, type: 'image/png' },
  { dst: 'assets/img/icons/apple-touch-icon.png', zone: EMBLEME, taille: 180, type: 'image/png' },
  { dst: 'assets/img/icons/favicon-96.png', zone: EMBLEME, taille: 96, type: 'image/png' },
  { dst: 'assets/img/icons/favicon-48.png', zone: EMBLEME, taille: 48, type: 'image/png' },
  { dst: 'assets/img/icons/favicon-32.png', zone: EMBLEME, taille: 32, type: 'image/png' },
  { dst: 'assets/img/icons/favicon-16.png', zone: EMBLEME, taille: 16, type: 'image/png' }
];

async function navigateur() {
  for (const channel of ['msedge', 'chrome']) {
    try { return await chromium.launch({ channel }); } catch { /* on essaie le suivant */ }
  }
  throw new Error('Ni Edge ni Chrome n’a pu être lancé.');
}

if (!fs.existsSync(SOURCE)) {
  console.error('Écusson introuvable : ' + SOURCE);
  process.exit(1);
}
const url = 'data:image/png;base64,' + fs.readFileSync(SOURCE).toString('base64');

const b = await navigateur();
const page = await b.newPage();
const rendus = await page.evaluate(async ({ url, fichiers }) => {
  const img = new Image();
  img.src = url;
  await img.decode();
  return fichiers.map(({ zone: [x, y, cote], taille, type }) => {
    let c = document.createElement('canvas');
    c.width = c.height = cote;
    c.getContext('2d').drawImage(img, x, y, cote, cote, 0, 0, cote, cote);
    while (c.width / 2 >= taille) {
      const t = document.createElement('canvas');
      t.width = t.height = Math.round(c.width / 2);
      const ctx = t.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(c, 0, 0, t.width, t.height);
      c = t;
    }
    const fin = document.createElement('canvas');
    fin.width = fin.height = taille;
    const ctx = fin.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(c, 0, 0, taille, taille);
    return fin.toDataURL(type, 0.82).split(',')[1];
  });
}, { url, fichiers: FICHIERS });
await b.close();

FICHIERS.forEach((f, i) => {
  const buf = Buffer.from(rendus[i], 'base64');
  fs.writeFileSync(path.join(RACINE, f.dst), buf);
  console.log(`${f.dst.padEnd(48)} ${String(f.taille).padStart(4)} px  ${(buf.length / 1024).toFixed(1).padStart(6)} Ko`);
});
