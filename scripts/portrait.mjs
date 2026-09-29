// Fabrique des portraits de personnages : recadrage 3/4 et conversion en WebP.
//
// Le poste n'a ni Pillow, ni sharp, ni ImageMagick : c'est le navigateur (Edge
// ou Chrome, déjà installés) qui sert de moteur d'image, piloté par
// playwright-core. Rien de tout cela ne part en ligne.
//
//   npm run portrait -- apercu   <photo>
//       Donne les dimensions et écrit un aperçu léger dans .apercus/, pour
//       choisir le cadrage sans ouvrir une photo de 14 Mo.
//
//   npm run portrait -- recadrer <photo> <x> <y> <largeur> <nom>
//       Découpe un rectangle au format 3/4 (la hauteur vaut largeur × 4/3) à
//       partir du coin (x, y), en pixels de la photo d'ORIGINE, et l'enregistre
//       en 900 × 1200 dans assets/img/personnages/personnages-<nom>.webp.
//
//   npm run portrait -- planche  <nom> [<nom> …]
//       Met côte à côte les portraits indiqués, dans .apercus/planche.png,
//       pour vérifier les cadrages d'un seul coup d'œil.
//
// Méthode qui a fait ses preuves : aperçu → repérer la tête sur l'aperçu →
// convertir en pixels d'origine (l'aperçu indique l'échelle) → recadrer →
// planche. Viser le visage dans le tiers haut du portrait, et garder dans le
// cadre l'accessoire qui dit le rôle (l'écu du maître d'armes, les épées de
// l'écuyère). Supprimer ensuite le JPEG : il ne va ni en ligne ni dans git.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORTRAITS = path.join(RACINE, 'assets/img/personnages');
const APERCUS = path.join(RACINE, '.apercus');
const SORTIE = { w: 900, h: 1200 };
const QUALITE = 0.8;

async function navigateur() {
  for (const channel of ['msedge', 'chrome']) {
    try { return await chromium.launch({ channel }); } catch { /* on essaie le suivant */ }
  }
  throw new Error('Ni Edge ni Chrome n’a pu être lancé.');
}

function lire(photo) {
  const chemin = path.isAbsolute(photo) ? photo : path.join(PORTRAITS, photo);
  if (!fs.existsSync(chemin)) throw new Error('Photo introuvable : ' + chemin);
  const ext = path.extname(chemin).toLowerCase();
  const type = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return { chemin, url: `data:${type};base64,` + fs.readFileSync(chemin).toString('base64') };
}

// Dessine une zone de l'image source dans un canevas et rend du WebP en base64.
async function dessiner(page, url, zone, sortie) {
  return page.evaluate(async ({ url, zone, sortie, qualite }) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const z = zone || { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
    const c = document.createElement('canvas');
    c.width = sortie.w;
    c.height = sortie.h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, z.x, z.y, z.w, z.h, 0, 0, sortie.w, sortie.h);
    return { webp: c.toDataURL('image/webp', qualite).split(',')[1], w: img.naturalWidth, h: img.naturalHeight };
  }, { url, zone, sortie, qualite: QUALITE });
}

async function dimensions(page, url) {
  return page.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { w: img.naturalWidth, h: img.naturalHeight };
  }, url);
}

const [commande, ...args] = process.argv.slice(2);
const b = await navigateur();
const page = await b.newPage();
try {
  if (commande === 'apercu') {
    const { chemin, url } = lire(args[0]);
    const d = await dimensions(page, url);
    const echelle = Math.max(d.w, d.h) / 720;
    const ap = { w: Math.round(d.w / echelle), h: Math.round(d.h / echelle) };
    const { webp } = await dessiner(page, url, null, ap);
    fs.mkdirSync(APERCUS, { recursive: true });
    const dst = path.join(APERCUS, path.basename(chemin).replace(/\.[^.]+$/, '') + '.webp');
    fs.writeFileSync(dst, Buffer.from(webp, 'base64'));
    console.log(`${path.basename(chemin)} : ${d.w} × ${d.h} (${d.w > d.h ? 'paysage' : 'portrait'})`);
    console.log(`aperçu ${ap.w} × ${ap.h} : ${path.relative(RACINE, dst)}`);
    console.log(`échelle : 1 px d'aperçu = ${echelle.toFixed(3)} px d'origine`);
    console.log(`largeur maximale d'un cadrage 3/4 : ${Math.min(d.w, Math.floor(d.h * 3 / 4))} px`);
  } else if (commande === 'recadrer') {
    const [photo, x, y, largeur, nom] = args;
    if (!nom) throw new Error('Usage : recadrer <photo> <x> <y> <largeur> <nom>');
    const { url } = lire(photo);
    const d = await dimensions(page, url);
    const zone = { x: +x, y: +y, w: +largeur, h: Math.round(+largeur * 4 / 3) };
    if (zone.x < 0 || zone.y < 0 || zone.x + zone.w > d.w || zone.y + zone.h > d.h) {
      throw new Error(`Le cadrage sort de la photo (${d.w} × ${d.h}) : `
        + `x ${zone.x} → ${zone.x + zone.w}, y ${zone.y} → ${zone.y + zone.h}.`);
    }
    const { webp } = await dessiner(page, url, zone, SORTIE);
    const dst = path.join(PORTRAITS, `personnages-${nom}.webp`);
    fs.writeFileSync(dst, Buffer.from(webp, 'base64'));
    const agrandi = SORTIE.w / zone.w;
    console.log(`${path.relative(RACINE, dst)} : ${SORTIE.w} × ${SORTIE.h}, ${(fs.statSync(dst).size / 1024).toFixed(0)} Ko`
      + (agrandi > 1.3 ? `  — agrandie ${agrandi.toFixed(1)} ×, le portrait sera un peu flou` : ''));
  } else if (commande === 'planche') {
    if (!args.length) throw new Error('Usage : planche <nom> [<nom> …]');
    const vignettes = args.map(n => {
      const f = path.join(PORTRAITS, `personnages-${n}.webp`);
      if (!fs.existsSync(f)) throw new Error('Portrait introuvable : ' + f);
      return `<figure><img src="data:image/webp;base64,${fs.readFileSync(f).toString('base64')}"><figcaption>${n}</figcaption></figure>`;
    }).join('');
    await page.setViewportSize({ width: 1000, height: 400 });
    await page.setContent(`<style>body{margin:0;background:#2b2b2b;color:#eee;font:13px system-ui;
      display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:10px}figure{margin:0}
      img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;border-radius:8px}
      figcaption{text-align:center;padding:4px}</style>${vignettes}`);
    await page.waitForTimeout(300);
    fs.mkdirSync(APERCUS, { recursive: true });
    const dst = path.join(APERCUS, 'planche.png');
    await page.screenshot({ path: dst, fullPage: true });
    console.log(`planche de ${args.length} portrait(s) : ${path.relative(RACINE, dst)}`);
  } else {
    console.log('Commandes : apercu <photo> | recadrer <photo> <x> <y> <largeur> <nom> | planche <nom>…');
    process.exitCode = 1;
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  await b.close();
}
