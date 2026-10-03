// Analyse des costumes des personnages : archive, état, page à partager.
//
// L'analyse se fait à l'œil, portrait par portrait, avec la grille de repères
// de .claude/skills/costumes/ (siècle, région, pièces qui dénotent). Ce script
// en tient le registre, costumes/analyse.json, qui n'est jamais mis en ligne.
//
//   npm run costumes
//       État : personnages à analyser (nouveaux venus, portrait remplacé),
//       fiches incomplètes, écarts avec le site, analyses sans personnage.
//   npm run costumes -- reprendre <nom>
//       Ouvre une fiche vierge pour ce personnage. L'analyse précédente passe
//       dans son historique : rien n'est effacé.
//   npm run costumes -- zoom <nom> <x> <y> <largeur> [<hauteur>]
//       Agrandit un détail du portrait (en pixels du portrait 900 × 1200)
//       dans .apercus/zoom-<nom>.png.
//   npm run costumes -- appliquer
//       Reporte siècle, époque et région dans assets/js/personnages.js.
//   npm run costumes -- page
//       Fabrique la page à partager dans costumes/page/ (non versionné).
//
// Chaque fiche garde l'empreinte du portrait analysé : un portrait remplacé
// remet le personnage dans la liste « à analyser ».

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PERSONNAGES = path.join(RACINE, 'assets/js/personnages.js');
const ARCHIVE = path.join(RACINE, 'costumes/analyse.json');
const PAGE = path.join(RACINE, 'costumes/page');
const APERCUS = path.join(RACINE, '.apercus');

const SIECLES = { 11: 'XIe siècle', 12: 'XIIe siècle', 13: 'XIIIe siècle', 14: 'XIVe siècle', 15: 'XVe siècle' };
const GROUPES = [
  { verdict: 'affiche', classe: 'ok', titre: 'Époque affichée',
    intro: 'Le costume correspond à l’époque affichée. Les remarques sont des finitions, pour qui a envie d’aller plus loin.' },
  { verdict: 'a-revoir', classe: 'revoir', titre: 'Époque affichée, une piste pour aller plus loin',
    intro: 'La base du costume est juste et son époque s’affiche sur le site. Une pièce vient d’ailleurs : le jour où l’envie viendra de la faire évoluer, c’est elle qui fera gagner le plus au costume.' },
  { verdict: 'rien', classe: 'rien', titre: 'Époque à venir',
    intro: 'Sur la photo, ces costumes ne se rattachent pas encore à une époque précise entre le XIe et le XVe siècle : le site n’en affiche donc aucune, sans rien enlever au personnage. Le conseil indique la pièce qui suffirait à en faire apparaître une.' },
];
const VERDICTS = GROUPES.map(g => g.verdict);
const NOTES = [['tient', 'Les points forts'], ['details', 'Pour peaufiner'], ['denote', 'À faire évoluer'], ['pourquoi', 'Où en est le costume'], ['piste', 'Conseil']];
const ORDRE_CHAMPS = ['nom', 'date', 'empreinte', 'verdict', 'siecle', 'epoque', 'lieu', 'alt',
  'tient', 'details', 'denote', 'pourquoi', 'piste', 'arbitrage', 'historique'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

// --- Lecture et écriture ------------------------------------------------------

// Chaque personnage est identifié dans l'archive par son nom ; deux
// personnages du même nom (un membre, deux costumes) le sont par
// « nom — rôle ». C'est la clé `cle`, reprise dans le champ `nom` des fiches.
export function lirePersonnages() {
  const bac = {};
  new Function('window', fs.readFileSync(PERSONNAGES, 'utf8'))(bac);
  const liste = bac.EC_PERSONNAGES || [];
  const compte = {};
  for (const p of liste) compte[p.name] = (compte[p.name] || 0) + 1;
  for (const p of liste) p.cle = compte[p.name] > 1 ? `${p.name} — ${p.role}` : p.name;
  return liste;
}

function lireArchive() {
  if (!fs.existsSync(ARCHIVE)) return { page: '', decor: [], personnages: [] };
  return JSON.parse(fs.readFileSync(ARCHIVE, 'utf8'));
}

// Les fiches suivent l'ordre du carrousel ; une analyse sans personnage reste
// à la fin, le temps de décider si c'est un renommage.
function ecrireArchive(archive, personnages) {
  const rang = new Map(personnages.map((p, i) => [p.cle, i]));
  archive.personnages.sort((a, b) => (rang.get(a.nom) ?? 1e9) - (rang.get(b.nom) ?? 1e9));
  archive.personnages = archive.personnages.map(ordonner);
  fs.mkdirSync(path.dirname(ARCHIVE), { recursive: true });
  fs.writeFileSync(ARCHIVE, JSON.stringify(archive, null, 2) + '\n');
}

function ordonner(fiche) {
  const out = {};
  for (const k of ORDRE_CHAMPS) if (fiche[k] !== undefined) out[k] = fiche[k];
  for (const k of Object.keys(fiche)) if (!(k in out)) out[k] = fiche[k];
  return out;
}

function empreinte(img) {
  const f = path.join(RACINE, img || '');
  if (!img || !fs.existsSync(f)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 16);
}

export function slug(texte) {
  return String(texte).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function trouver(personnages, nom) {
  if (!nom) throw new Error('Préciser le nom du personnage.');
  const s = slug(nom);
  const exact = personnages.filter(p => slug(p.cle) === s || slug(p.name) === s);
  if (exact.length === 1) return exact[0];
  const parCle = exact.filter(p => slug(p.cle) === s);
  if (parCle.length === 1) return parCle[0];
  const proches = personnages.filter(p => slug(p.cle).includes(s));
  if (proches.length === 1) return proches[0];
  throw new Error(proches.length
    ? `« ${nom} » désigne plusieurs personnages : ${proches.map(p => p.cle).join(', ')}.`
    : `Aucun personnage ne s’appelle « ${nom} ».`);
}

function aujourdhui() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateFr(iso) {
  const [a, m, j] = String(iso).split('-').map(Number);
  return a && m && j ? `${j === 1 ? '1er' : j} ${MOIS[m - 1]} ${a}` : String(iso);
}

// --- Contrôles ----------------------------------------------------------------

function manques(f) {
  if (!VERDICTS.includes(f.verdict)) {
    return [f.verdict ? `verdict « ${f.verdict} » inconnu (${VERDICTS.join(', ')})` : 'verdict'];
  }
  const m = [];
  if (f.verdict === 'rien') {
    if (!f.pourquoi) m.push('pourquoi');
  } else {
    if (!SIECLES[f.siecle]) m.push('siecle (de 11 à 15)');
    if (!f.lieu) m.push('lieu');
    if (!f.tient) m.push('tient');
    if (f.verdict === 'a-revoir' && !f.denote) m.push('denote');
  }
  if (!f.empreinte) m.push('empreinte');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date || '')) m.push('date');
  return m;
}

const dire = v => v === undefined || v === '' ? 'rien' : typeof v === 'string' ? `« ${v} »` : String(v);

// Ce que personnages.js doit porter pour refléter l'analyse.
function ecarts(f, p) {
  const attendu = f.verdict === 'rien'
    ? { epoqueAffichee: false, epoque: undefined, lieu: undefined }
    : { epoqueAffichee: true, siecle: f.siecle, epoque: f.epoque || undefined, lieu: f.lieu || undefined };
  return Object.entries(attendu)
    .filter(([k, v]) => (p[k] === '' ? undefined : p[k]) !== v)
    .map(([k, v]) => `${k} : le site porte ${dire(p[k])}, l’analyse ${dire(v)}`);
}

export function etatCostumes() {
  const personnages = lirePersonnages();
  const archive = lireArchive();
  const fiches = new Map(archive.personnages.map(f => [f.nom, f]));
  const etat = { total: personnages.length, aJour: [], aAnalyser: [], incompletes: [], ecarts: [], orphelines: [] };
  for (const p of personnages) {
    const f = fiches.get(p.cle);
    if (!f) { etat.aAnalyser.push({ nom: p.cle, raison: 'jamais analysé' }); continue; }
    if (!f.verdict) { etat.aAnalyser.push({ nom: p.cle, raison: 'fiche ouverte, à remplir' }); continue; }
    const m = manques(f);
    if (m.length) { etat.incompletes.push({ nom: p.cle, manques: m }); continue; }
    if (f.empreinte !== empreinte(p.img)) {
      etat.aAnalyser.push({ nom: p.cle, raison: `portrait remplacé depuis l’analyse du ${dateFr(f.date)}` });
    } else {
      etat.aJour.push(p.cle);
    }
    const e = ecarts(f, p);
    if (e.length) etat.ecarts.push({ nom: p.cle, ecarts: e });
  }
  const noms = new Set(personnages.map(p => p.cle));
  const parEmpreinte = new Map(personnages.map(p => [empreinte(p.img), p.cle]));
  for (const f of archive.personnages) {
    if (noms.has(f.nom)) continue;
    const meme = parEmpreinte.get(f.empreinte);
    etat.orphelines.push({ nom: f.nom, indice: meme ? `même portrait que « ${meme} » : renommé ?` : 'parti ou renommé ?' });
  }
  return etat;
}

// --- Commandes ----------------------------------------------------------------

function afficherEtat() {
  const etat = etatCostumes();
  const bloc = (titre, lignes) => {
    if (!lignes.length) return;
    console.log(`\n${titre} (${lignes.length})`);
    for (const l of lignes) console.log('  - ' + l);
  };
  console.log(`Costumes : ${etat.total} personnages, ${etat.aJour.length} analyse(s) à jour.`);
  bloc('À analyser', etat.aAnalyser.map(x => `${x.nom} : ${x.raison}`));
  bloc('Fiches incomplètes dans costumes/analyse.json', etat.incompletes.map(x => `${x.nom} : manque ${x.manques.join(', ')}`));
  bloc('Écarts avec le site, à corriger par « npm run costumes -- appliquer »',
    etat.ecarts.flatMap(x => x.ecarts.map(e => `${x.nom}, ${e}`)));
  bloc('Analyses sans personnage', etat.orphelines.map(x => `${x.nom} : ${x.indice}`));
  if (!etat.aAnalyser.length && !etat.incompletes.length && !etat.ecarts.length && !etat.orphelines.length) {
    console.log('Tout est à jour.');
  }
  if (etat.incompletes.length) process.exitCode = 1;
}

function reprendre(nom) {
  const personnages = lirePersonnages();
  const p = trouver(personnages, nom);
  const archive = lireArchive();
  const neuve = { nom: p.cle, date: aujourdhui(), empreinte: empreinte(p.img), verdict: '' };
  let f = archive.personnages.find(x => x.nom === p.cle);
  if (f) {
    const { historique = [], ...ancienne } = f;
    if (ancienne.verdict) historique.push(ancienne);
    for (const k of Object.keys(f)) delete f[k];
    Object.assign(f, neuve, { historique });
  } else {
    f = { ...neuve, historique: [] };
    archive.personnages.push(f);
  }
  ecrireArchive(archive, personnages);
  console.log(`Fiche de « ${p.cle} » ouverte dans costumes/analyse.json`
    + (f.historique.length ? ' ; l’analyse précédente est dans son historique.' : '.'));
  console.log(`Portrait à analyser : ${p.img}`);
}

async function navigateur(chromium) {
  for (const channel of ['msedge', 'chrome']) {
    try { return await chromium.launch({ channel }); } catch { /* on essaie le suivant */ }
  }
  throw new Error('Ni Edge ni Chrome n’a pu être lancé.');
}

async function zoom(nom, x, y, largeur, hauteur) {
  const p = trouver(lirePersonnages(), nom);
  const zone = { x: +x, y: +y, w: +largeur, h: +(hauteur || largeur) };
  if (![zone.x, zone.y, zone.w, zone.h].every(Number.isFinite) || zone.w <= 0 || zone.h <= 0) {
    throw new Error('Usage : zoom <nom> <x> <y> <largeur> [<hauteur>]');
  }
  const { chromium } = await import('playwright-core');
  const b = await navigateur(chromium);
  try {
    const page = await b.newPage();
    const url = 'data:image/webp;base64,' + fs.readFileSync(path.join(RACINE, p.img)).toString('base64');
    const r = await page.evaluate(async ({ url, zone }) => {
      const img = new Image();
      img.src = url;
      await img.decode();
      const { naturalWidth: w, naturalHeight: h } = img;
      if (zone.x < 0 || zone.y < 0 || zone.x + zone.w > w || zone.y + zone.h > h) return { hors: `${w} × ${h}` };
      // Le détail est agrandi jusqu'à 900 px de large pour se lire à l'œil.
      const echelle = Math.max(1, 900 / zone.w);
      const c = document.createElement('canvas');
      c.width = Math.round(zone.w * echelle);
      c.height = Math.round(zone.h * echelle);
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, zone.x, zone.y, zone.w, zone.h, 0, 0, c.width, c.height);
      return { png: c.toDataURL('image/png').split(',')[1] };
    }, { url, zone });
    if (r.hors) throw new Error(`La zone sort du portrait (${r.hors}).`);
    fs.mkdirSync(APERCUS, { recursive: true });
    const dst = path.join(APERCUS, `zoom-${slug(p.cle)}.png`);
    fs.writeFileSync(dst, Buffer.from(r.png, 'base64'));
    console.log(`${path.relative(RACINE, dst)} : zone ${zone.w} × ${zone.h} du portrait de ${p.name}`);
  } finally {
    await b.close();
  }
}

const CHAINE = String.raw`'(?:[^'\\]|\\.)*'`;
const js = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

// Réécrit la ligne d'un personnage : siècle, époque affichée ou non, époque
// et région. Le reste de la ligne n'est pas touché.
function reecrire(ligne, f) {
  const l = ligne
    .replace(/,\s*epoqueAffichee:\s*(?:true|false)/, '')
    .replace(new RegExp(String.raw`,\s*epoque:\s*` + CHAINE), '')
    .replace(new RegExp(String.raw`,\s*lieu:\s*` + CHAINE), '');
  const champs = f.verdict === 'rien'
    ? ['epoqueAffichee:false']
    : [`siecle:${f.siecle}`, 'epoqueAffichee:true', ...(f.epoque ? [`epoque:${js(f.epoque)}`] : []), `lieu:${js(f.lieu)}`];
  if (/siecle:\s*\d+/.test(l)) {
    // Un costume écarté garde son siècle : il ne s'affiche plus, voilà tout.
    return f.verdict === 'rien'
      ? l.replace(/siecle:\s*\d+/, m => `${m}, ${champs.join(', ')}`)
      : l.replace(/siecle:\s*\d+/, () => champs.join(', '));
  }
  return l.replace(new RegExp(String.raw`name:\s*` + CHAINE), m => `${m}, ${champs.join(', ')}`);
}

function appliquer() {
  const personnages = lirePersonnages();
  const archive = lireArchive();
  const lignes = fs.readFileSync(PERSONNAGES, 'utf8').split('\n');
  const faits = [];
  for (const f of archive.personnages) {
    if (manques(f).length) continue;
    const p = personnages.find(x => x.cle === f.nom);
    if (!p || !ecarts(f, p).length) continue;
    const i = lignes.findIndex(l => l.includes(`name:${js(p.name)}`) && l.includes(`role:${js(p.role)}`));
    if (i < 0) { console.warn(`${f.nom} : ligne introuvable dans personnages.js, à corriger à la main.`); continue; }
    lignes[i] = reecrire(lignes[i], f);
    faits.push(f.nom);
  }
  if (!faits.length) { console.log('Le site est déjà aligné sur l’analyse.'); return; }
  fs.writeFileSync(PERSONNAGES, lignes.join('\n'));
  console.log(`assets/js/personnages.js mis à jour : ${faits.join(', ')}. Lancer npm run check.`);
}

// --- Page à partager ----------------------------------------------------------

function echapper(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Texte de l'archive vers HTML : espaces insécables à la française, et
// *mot* pour l'italique (un terme étranger, par exemple).
function texte(s) {
  return echapper(s)
    .replace(/ ([:;!?€»])/g, ' $1')
    .replace(/« /g, '« ')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>');
}

function carte({ p, f, fichier }) {
  const ligne = f.verdict === 'rien'
    ? '<span class="vide">Pas encore d’époque affichée</span>'
    : `<span>${texte(f.epoque || SIECLES[f.siecle])}</span><span>${texte(f.lieu)}</span>`;
  const notes = NOTES.filter(([k]) => f[k])
    .map(([k, libelle]) => `<div><dt${k === 'denote' ? ' class="denote"' : ''}>${libelle}</dt><dd>${texte(f[k])}</dd></div>`)
    .join('\n          ');
  return `
      <article class="fiche" id="${slug(p.cle)}">
        <img src="img/${fichier}" alt="${echapper(f.alt || p.alt || p.name)}" width="900" height="1200" loading="lazy">
        <div class="fiche-tete"><h3>${texte(p.name)}</h3><p class="role">${texte(p.role)}</p></div>
        <p class="affiche"><span class="affiche-label">Sur le site</span>${ligne}</p>
        <dl class="notes">
          ${notes}
        </dl>
      </article>`;
}

function gabarit({ retenus, decor, date }) {
  const parGroupe = GROUPES.map(g => ({ ...g, fiches: retenus.filter(r => r.f.verdict === g.verdict) }))
    .filter(g => g.fiches.length);
  const bilan = parGroupe.map(g => `
    <div class="bilan-ligne">
      <p class="bilan-titre"><span class="pastille ${g.classe}" aria-hidden="true"></span>${texte(g.titre)} <span class="compte">${g.fiches.length}</span></p>
      <p class="noms">${g.fiches.map(r => `<a href="#${slug(r.p.cle)}">${texte(r.p.name)}</a>`).join('')}</p>
    </div>`).join('');
  const groupes = parGroupe.map(g => `
  <section class="groupe" aria-labelledby="groupe-${g.classe}">
    <div class="groupe-tete">
      <h2 id="groupe-${g.classe}"><span class="pastille ${g.classe}" aria-hidden="true"></span>${texte(g.titre)}</h2>
      <p>${texte(g.intro)}</p>
    </div>
    <div class="fiches">${g.fiches.map(carte).join('\n')}
    </div>
  </section>`).join('\n');
  const decorHtml = decor.length ? `
  <section class="decor" aria-labelledby="decor-titre">
    <h2 id="decor-titre">Le décor des photos</h2>
    ${decor.map(p => `<p>${texte(p)}</p>`).join('\n    ')}
  </section>` : '';

  return `<title>Costumes de la mesnie</title>
<style>
${STYLE}</style>

<main class="page">
  <header class="entete">
    <p class="eyebrow">L’Épée et le Chaudron</p>
    <h1>Les costumes de la mesnie</h1>
    <p class="lede">${texte(`Sous l’accroche de chaque personnage, le site affiche une ligne discrète : le siècle et la région que représente son costume. Cette page reprend les ${retenus.length} portraits un par un : ce qui fonctionne déjà, et une piste quand il y en a une.`)}</p>
  </header>

  <section class="methode" aria-labelledby="methode-titre">
    <h2 id="methode-titre">Comment les photos ont été lues</h2>
    <ul>
      <li>${texte('Cette page n’est pas un classement. Elle est là pour donner des idées pour la prochaine pièce à coudre ou à acheter, à son rythme : un costume se construit sur des années, et on joue d’abord pour le plaisir de partager.')}</li>
      <li>${texte('Chaque fiche part du portrait publié sur le site. Une seule photo ne montre pas tout : jambes et chaussures sont souvent hors cadre.')}</li>
      <li>${texte('Le siècle est celui que désignent les pièces les plus datantes : coiffure, coupe, fermetures, armement. La région n’est précisée que lorsque le costume la désigne, sinon la ligne indique « Europe ».')}</li>
      <li>${texte('Une pièce « à faire évoluer » vient d’une autre époque, ou de l’imaginaire médiéval-fantastique, très présent sur les fêtes. Quand la base du costume est juste, l’époque s’affiche quand même.')}</li>
      <li>${texte('Une source contredit une fiche (enluminure, fouille, pièce de musée) ? Signalez-la, et la fiche comme la ligne du site seront corrigées.')}</li>
    </ul>
  </section>

  <section class="bilan" aria-labelledby="bilan-titre">
    <h2 id="bilan-titre">En bref</h2>${bilan}
  </section>
${groupes}
${decorHtml}

  <footer class="pied">
    L’Épée et le Chaudron · analyse des portraits publiés sur <a href="https://epee-chaudron.fr/#personnages">epee-chaudron.fr</a>, mise à jour le ${dateFr(date)}.
  </footer>
</main>
`;
}

function page() {
  const personnages = lirePersonnages();
  const archive = lireArchive();
  const fiches = new Map(archive.personnages.map(f => [f.nom, f]));
  const retenus = personnages
    .map(p => ({ p, f: fiches.get(p.cle) }))
    .filter(r => r.f && !manques(r.f).length)
    .map(r => ({ ...r, fichier: slug(r.p.cle) + path.extname(r.p.img) }));
  if (!retenus.length) throw new Error('Aucune analyse complète : rien à mettre en page.');

  fs.rmSync(PAGE, { recursive: true, force: true });
  fs.mkdirSync(path.join(PAGE, 'img'), { recursive: true });
  for (const r of retenus) fs.copyFileSync(path.join(RACINE, r.p.img), path.join(PAGE, 'img', r.fichier));
  const date = retenus.map(r => r.f.date).sort().at(-1);
  const html = gabarit({ retenus, decor: archive.decor || [], date });
  fs.writeFileSync(path.join(PAGE, 'index.html'), html);
  // Aperçu local : la publication ajoute elle-même doctype, charset et viewport.
  fs.writeFileSync(path.join(PAGE, 'apercu.html'),
    '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n'
    + html + '</body></html>\n');

  const etat = etatCostumes();
  console.log(`Page prête : costumes/page/index.html, ${retenus.length} fiches, portraits dans costumes/page/img/.`);
  console.log('Aperçu local : npx vite costumes/page, puis /apercu.html');
  console.log(`Publication : root costumes/page, files ${JSON.stringify(retenus.map(r => 'img/' + r.fichier))}`);
  console.log(archive.page ? `À republier sur ${archive.page}` : 'Première publication : noter l’adresse obtenue dans « page » de costumes/analyse.json.');
  if (etat.aAnalyser.length) {
    console.log(`Attention, ${etat.aAnalyser.length} personnage(s) à analyser : ${etat.aAnalyser.map(x => x.nom).join(', ')}.`);
  }
}

// --- Feuille de style de la page ----------------------------------------------
// Charte du site (DESIGN.md) : bleu royal, bleu nuit, or, une pointe de feu ;
// Georgia pour les titres, police système pour le texte.

const STYLE = `/* Planche de fiches de costume, aux couleurs de la bannière (charte du site) :
   en-tête sobre, bilan en trois lignes, puis les fiches groupées par verdict. */
:root{
  --bg:#fffaf0;
  --surface:#ffffff;
  --ink:#17120d;
  --text:#2c271f;
  --muted:#6a6257;
  --blue:#123d91;
  --navy:#071a44;
  --fire:#b8390f;
  --line:rgba(23,18,13,.13);
  --dot-ok:#123d91;
  --dot-warn:#e0b400;
  --dot-off:#a79c8c;
  --chip-bg:#f3ecdf;
  --chip-hover:#e9dfcc;
  --focus:#f2cc28;
  --serif:Georgia,'Times New Roman',serif;
  --sans:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0c1222;
    --surface:#141c31;
    --ink:#f3ede2;
    --text:#ddd5c7;
    --muted:#a9a091;
    --blue:#9db8f5;
    --navy:#eef2fb;
    --fire:#f08a62;
    --line:rgba(255,250,240,.13);
    --dot-ok:#7fa2f0;
    --dot-warn:#f2cc28;
    --dot-off:#7d7568;
    --chip-bg:#1d2741;
    --chip-hover:#263252;
    --focus:#f2cc28;
    color-scheme:dark;
  }
}
:root[data-theme="dark"]{
  --bg:#0c1222;
  --surface:#141c31;
  --ink:#f3ede2;
  --text:#ddd5c7;
  --muted:#a9a091;
  --blue:#9db8f5;
  --navy:#eef2fb;
  --fire:#f08a62;
  --line:rgba(255,250,240,.13);
  --dot-ok:#7fa2f0;
  --dot-warn:#f2cc28;
  --dot-off:#7d7568;
  --chip-bg:#1d2741;
  --chip-hover:#263252;
  --focus:#f2cc28;
  color-scheme:dark;
}

*{box-sizing:border-box}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}
body{
  margin:0;
  background:var(--bg);
  color:var(--text);
  font-family:var(--sans);
  font-size:16px;
  line-height:1.55;
}
.page{max-width:1080px;margin:0 auto;padding:40px 16px 56px}
h1,h2,h3{text-wrap:balance;margin:0}
p{text-wrap:pretty;margin:0}
a{color:inherit}
a:focus-visible{outline:3px solid var(--focus);outline-offset:2px;border-radius:6px}

/* --- En-tête --- */
.entete{display:grid;gap:14px;max-width:68ch}
.eyebrow{
  color:var(--fire);font-size:.75rem;font-weight:900;
  letter-spacing:.09em;text-transform:uppercase;
}
h1{
  font-family:var(--serif);font-weight:400;color:var(--navy);
  font-size:clamp(1.9rem,4.4vw,2.6rem);line-height:1.06;letter-spacing:-.025em;
}
.lede{font-size:1.06rem;color:var(--text)}

.methode{
  margin-top:28px;display:grid;gap:10px;max-width:68ch;
  padding:18px 20px;border:1px solid var(--line);border-radius:18px;background:var(--surface);
}
.methode h2{font-family:var(--sans);font-size:1rem;font-weight:700;color:var(--navy)}
.methode ul{margin:0;padding-left:1.1rem;display:grid;gap:6px;color:var(--text)}

/* --- Bilan --- */
.bilan{margin-top:36px;display:grid;gap:14px}
.bilan h2{font-family:var(--serif);font-weight:400;font-size:1.5rem;color:var(--navy)}
.bilan-ligne{
  display:grid;grid-template-columns:minmax(0,15rem) minmax(0,1fr);gap:8px 20px;align-items:baseline;
  padding-top:14px;border-top:1px solid var(--line);
}
.bilan-titre{display:flex;align-items:baseline;gap:10px;font-weight:700;color:var(--ink)}
.bilan-titre .compte{font-weight:400;color:var(--muted);font-variant-numeric:tabular-nums}
.noms{display:flex;flex-wrap:wrap;gap:6px}
.noms a{
  display:inline-flex;align-items:center;min-height:40px;padding:0 14px;
  border-radius:999px;background:var(--chip-bg);color:var(--ink);
  text-decoration:none;font-size:.92rem;
}
.noms a:hover{background:var(--chip-hover)}

.pastille{
  flex:none;width:10px;height:10px;border-radius:50%;
  display:inline-block;transform:translateY(-1px);
}
.pastille.ok{background:var(--dot-ok)}
.pastille.revoir{background:var(--dot-warn)}
.pastille.rien{background:var(--dot-off)}

/* --- Groupes et fiches --- */
.groupe{margin-top:52px;display:grid;gap:18px}
.groupe-tete{display:grid;gap:6px;max-width:68ch}
.groupe-tete h2{
  display:flex;align-items:baseline;gap:12px;
  font-family:var(--serif);font-weight:400;color:var(--navy);
  font-size:clamp(1.45rem,2.6vw,1.9rem);line-height:1.12;letter-spacing:-.02em;
}
.groupe-tete h2 .pastille{width:12px;height:12px}
.groupe-tete p{color:var(--muted)}

.fiches{display:grid;gap:16px;grid-template-columns:minmax(0,1fr)}

.fiche{
  display:grid;gap:12px 16px;align-content:start;
  grid-template-columns:96px minmax(0,1fr);
  grid-template-areas:"photo tete" "photo affiche" "notes notes";
  padding:14px;background:var(--surface);
  border:1px solid var(--line);border-radius:18px;
  scroll-margin-top:16px;
}
@media (min-width:560px){
  .fiche{
    grid-template-columns:120px minmax(0,1fr);
    grid-template-areas:"photo tete" "photo affiche" "photo notes";
    grid-template-rows:auto auto 1fr;
  }
}
@media (min-width:880px){
  .fiches{grid-template-columns:repeat(2,minmax(0,1fr))}
  /* Une fiche seule sur sa rangée prend toute la largeur et se lit en travers. */
  .fiches > .fiche:last-child:nth-child(odd){
    grid-column:1 / -1;
    grid-template-columns:120px minmax(0,15rem) minmax(0,1fr);
    grid-template-areas:"photo tete notes" "photo affiche notes";
    grid-template-rows:auto 1fr;
  }
}
.fiche:target{outline:3px solid var(--focus);outline-offset:2px}
.fiche img{
  grid-area:photo;width:100%;max-width:100%;height:auto;aspect-ratio:3/4;
  object-fit:cover;object-position:50% 14%;border-radius:12px;display:block;
}
.fiche-tete{grid-area:tete;display:grid;gap:2px;align-content:start}
.fiche h3{font-size:1.07rem;line-height:1.18;color:var(--navy);font-weight:700}
.role{color:var(--blue);font-weight:700;font-size:.86rem}

/* La ligne telle que le site l'affiche sous l'accroche. */
.affiche{
  grid-area:affiche;display:grid;gap:1px;align-content:start;
  padding-top:8px;border-top:1px solid var(--line);
  color:var(--muted);font-size:.85rem;line-height:1.38;
}
.affiche-label{
  color:var(--fire);font-size:.68rem;font-weight:900;
  letter-spacing:.09em;text-transform:uppercase;margin-bottom:2px;
}
.affiche .vide{font-style:italic}

.notes{grid-area:notes;margin:0;display:grid;gap:8px;align-content:start;font-size:.95rem;line-height:1.5}
.notes div{display:grid;gap:1px}
.notes dt{font-weight:700;color:var(--ink);font-size:.86rem}
.notes dt.denote{color:var(--blue)}
.notes dd{margin:0;color:var(--text)}

/* --- Décor et pied de page --- */
.decor{margin-top:52px;display:grid;gap:10px;max-width:68ch}
.decor h2{font-family:var(--serif);font-weight:400;font-size:1.5rem;color:var(--navy)}
.pied{
  margin-top:48px;padding-top:16px;border-top:1px solid var(--line);
  color:var(--muted);font-size:.88rem;
}

@media (max-width:620px){
  .page{padding-block:28px 44px}
  .bilan-ligne{grid-template-columns:minmax(0,1fr)}
}
`;

// --- Lancement ----------------------------------------------------------------

const lance = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (lance) {
  const [commande, ...args] = process.argv.slice(2);
  try {
    if (!commande || commande === 'etat') afficherEtat();
    else if (commande === 'reprendre') reprendre(args.join(' '));
    else if (commande === 'zoom') await zoom(...args);
    else if (commande === 'appliquer') appliquer();
    else if (commande === 'page') page();
    else {
      console.log('Commandes : etat | reprendre <nom> | zoom <nom> <x> <y> <largeur> [<hauteur>] | appliquer | page');
      process.exitCode = 1;
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
