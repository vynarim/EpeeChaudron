// Devis de prestation pour un organisateur (mairie, comité des fêtes).
//
// Outil de poste, jamais mis en ligne. Le dépôt ne contient que la mécanique :
// les données privées (adresse, téléphone, SIRET, signature, tarifs, barème
// de déplacement) et les devis eux-mêmes vivent hors du dépôt, dans le
// dossier Contrats de l'association (variable EC_CONTRATS pour en changer) :
//
//   Contrats/_devis/association.json   identité, tarifs, barème, défauts
//   Contrats/_devis/signature.jpg      signature apposée sur les devis
//   Contrats/<Ville>/<année>/Devis <Ville> <année>.json   un devis : la source
//   Contrats/<Ville>/<année>/Devis <Ville> <année>.pdf    ce qui part au client
//
// Les textes des animations viennent de assets/js/ateliers.js, les photos de
// assets/img/ : le devis présente ce que présente le site.
//
//   npm run devis -- nouveau "<Ville>" [<année>]
//       Crée la fiche JSON du devis, numérotée, pré-remplie des valeurs par
//       défaut. Refuse d'écraser une fiche existante.
//   npm run devis -- "<chemin du .json>"
//       Contrôle la fiche, calcule les montants, fabrique le .html et le .pdf
//       à côté d'elle, et affiche le récapitulatif.
//   npm run devis -- liste
//       Les devis faits avec cet outil : numéro, client, dates, montant.
//   npm run devis -- equipe "<Nom>, <Nom>, …"
//       Ce que ces membres permettent de présenter, et ce qui ne sera pas
//       possible sans eux, d'après les ateliers des personnages du site.
//
// Qui anime quoi vient de assets/js/personnages.js (champ atelier). Un
// atelier qu'aucun personnage n'anime (vie de camp, défilé) est collectif :
// toujours possible. Une fiche qui nomme ses présents (champ presents) ne
// peut proposer que ce qu'ils animent.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTRATS = process.env.EC_CONTRATS
  || path.join(os.homedir(), 'OneDrive', 'Associations', 'L\'épée et le chaudron', 'Contrats');
const PRIVE = path.join(CONTRATS, '_devis');
const GABARIT = path.join(RACINE, 'scripts/devis.css');
const ATELIERS = path.join(RACINE, 'assets/js/ateliers.js');
const PERSONNAGES = path.join(RACINE, 'assets/js/personnages.js');

// Photos du bandeau, dans l'ordre : le camp, la cuisine, le combat.
const BANDEAU = ['accueil-troupe-camp', 'galerie-cuisine-foyer', 'galerie-armes-combattants'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

// --- Lecture ------------------------------------------------------------------

function stop(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function lireJson(fichier) {
  try { return JSON.parse(fs.readFileSync(fichier, 'utf8')); }
  catch (e) { stop(`${fichier} illisible : ${e.message}`); }
}

function lireAssociation() {
  const fichier = path.join(PRIVE, 'association.json');
  if (!fs.existsSync(fichier)) stop(`Données privées introuvables : ${fichier}\n  (dossier Contrats absent de ce poste, ou EC_CONTRATS à régler)`);
  return lireJson(fichier);
}

// Les membres et ce qu'ils animent. Un membre à deux costumes a deux entrées
// du même nom : leurs ateliers s'additionnent.
function lireMembres() {
  const bac = {};
  new Function('window', fs.readFileSync(PERSONNAGES, 'utf8'))(bac);
  const membres = new Map();
  for (const p of bac.EC_PERSONNAGES || []) {
    const cle = sansAccent(p.name);
    const m = membres.get(cle) || { nom: p.name, roles: new Set(), ateliers: new Set() };
    m.roles.add(p.role);
    for (const id of [].concat(p.atelier || [])) m.ateliers.add(id);
    membres.set(cle, m);
  }
  return membres;
}

const sansAccent = s => String(s).replace(/[’ʼ]/g, "'").normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Pour une liste de présents : qui couvre chaque atelier actif. Certains
// ateliers demandent plusieurs membres (un duel se livre à deux) :
// defauts.minimumParAtelier dans association.json.
function couverture(presents, ateliers, minimum = {}) {
  const membres = lireMembres();
  const inconnus = [], venus = [];
  for (const n of presents) {
    const m = membres.get(sansAccent(n));
    if (m) venus.push(m); else inconnus.push(n);
  }
  const animes = new Set([...membres.values()].flatMap(m => [...m.ateliers]));
  const par = {};
  for (const a of ateliers.filter(x => x.actif)) {
    const collectif = !animes.has(a.id);
    const qui = venus.filter(m => m.ateliers.has(a.id)).map(m => m.nom);
    const faut = minimum[a.id] || 1;
    par[a.id] = { atelier: a, collectif, qui, faut, possible: collectif || qui.length >= faut };
  }
  return { inconnus, venus, par };
}

function lireAteliers() {
  const bac = {};
  new Function('window', fs.readFileSync(ATELIERS, 'utf8'))(bac);
  return bac.EC_ATELIERS || [];
}

// Un devis ne s'écrit jamais dans le dépôt : il est public.
function horsDuDepot(fichier) {
  const rel = path.relative(RACINE, path.resolve(fichier));
  if (!rel.startsWith('..') && !path.isAbsolute(rel)) stop(`${fichier} est dans le dépôt du site, qui est public. Les devis restent dans ${CONTRATS}.`);
}

function devisExistants() {
  const trouves = [];
  const parcourir = dossier => {
    for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
      const p = path.join(dossier, e.name);
      if (e.isDirectory() && !e.name.startsWith('_')) parcourir(p);
      else if (e.isFile() && /^Devis .*\.json$/.test(e.name)) {
        try {
          const d = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (/^\d{4}-\d{3}$/.test(d.numero || '')) trouves.push({ fichier: p, devis: d });
        } catch { /* fiche en cours d'écriture : ignorée */ }
      }
    }
  };
  if (fs.existsSync(CONTRATS)) parcourir(CONTRATS);
  return trouves.sort((a, b) => a.devis.numero.localeCompare(b.devis.numero));
}

// --- Dates et montants --------------------------------------------------------

const iso = d => d.toISOString().slice(0, 10);
const jour = s => { const d = new Date(`${s}T12:00:00Z`); if (Number.isNaN(+d)) stop(`date invalide : ${s}`); return d; };
const dateLongue = s => { const d = jour(s); return `${d.getUTCDate() === 1 ? '1er' : d.getUTCDate()} ${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const jourLong = s => { const d = jour(s); return `${JOURS[d.getUTCDay()]} ${d.getUTCDate() === 1 ? '1er' : d.getUTCDate()} ${MOIS[d.getUTCMonth()]}`; };
const ajouterJours = (s, n) => { const d = jour(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const ecart = (a, b) => Math.round((jour(b) - jour(a)) / 86400000);
const arrondi = n => Math.round(n * 100) / 100;
const euros = n => `${n < 0 ? '−' : ''}${Math.abs(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`.replace(/ /g, ' ');

function periode(debut, fin) {
  const a = jour(debut), b = jour(fin);
  if (debut === fin) return `le ${jourLong(debut)} ${a.getUTCFullYear()}`;
  if (a.getUTCMonth() === b.getUTCMonth()) return `du ${JOURS[a.getUTCDay()]} ${a.getUTCDate() === 1 ? '1er' : a.getUTCDate()} au ${jourLong(fin)} ${b.getUTCFullYear()}`;
  return `du ${jourLong(debut)} au ${jourLong(fin)} ${b.getUTCFullYear()}`;
}

// --- Fiche vierge -------------------------------------------------------------

function nouveau(ville, annee) {
  if (!ville) stop('npm run devis -- nouveau "<Ville>" [<année>]');
  const asso = lireAssociation();
  const aujourdhui = iso(new Date());
  annee = annee || String(new Date().getFullYear() + (new Date().getMonth() >= 8 ? 1 : 0));
  const dossier = path.join(CONTRATS, ville, annee);
  const fichier = path.join(dossier, `Devis ${ville} ${annee}.json`);
  horsDuDepot(fichier);
  if (fs.existsSync(fichier)) stop(`La fiche existe déjà : ${fichier}`);

  const prefixe = aujourdhui.slice(0, 4);
  const derniers = devisExistants().map(x => x.devis.numero).filter(n => n.startsWith(prefixe));
  const rang = derniers.length ? Math.max(...derniers.map(n => +n.slice(5))) + 1 : 1;
  const ateliers = lireAteliers().filter(a => a.actif && !a.option).map(a => a.id);

  const fiche = {
    numero: `${prefixe}-${String(rang).padStart(3, '0')}`,
    date: aujourdhui,
    validite: ajouterJours(aujourdhui, asso.tarifs.validiteJours),
    client: { nom: '', attention: '', adresse: [] },
    evenement: { titre: '', lieu: '', debut: '', fin: '', installation: 'la veille en fin d’après-midi', defile: false, siecle: '', horaires: [] },
    prestation: { prixJour: asso.tarifs.vieDeCampJour },
    presents: [],
    ateliers,
    options: [],
    troupe: { ...asso.defauts.troupe },
    accueil: { ...asso.defauts.accueil, autres: [] },
    deplacement: { kmAller: null, peagesAller: null, source: '', offert: false },
    contactJourJ: { ...asso.association.contact },
    remise: null,
    notes: ''
  };
  fs.mkdirSync(dossier, { recursive: true });
  fs.writeFileSync(fichier, `${JSON.stringify(fiche, null, 2)}\n`);
  console.log(`✓ ${fichier}\n  Devis n° ${fiche.numero}, valable jusqu’au ${dateLongue(fiche.validite)}.`);
}

// --- Contrôle et calcul -------------------------------------------------------

function calculer(d, asso, ateliers) {
  const erreurs = [], alertes = [];
  const ev = d.evenement || {};
  const parId = Object.fromEntries(ateliers.map(a => [a.id, a]));

  if (!d.client?.nom) erreurs.push('client.nom est vide.');
  if (!ev.titre) erreurs.push('evenement.titre est vide.');
  if (!ev.debut || !ev.fin) erreurs.push('evenement.debut et evenement.fin sont obligatoires (AAAA-MM-JJ).');
  if (erreurs.length) return { erreurs, alertes };

  const nbJours = ecart(ev.debut, ev.fin) + 1;
  if (nbJours < 1) erreurs.push('evenement.fin précède evenement.debut.');
  if (ecart(d.date, d.validite) < 0) erreurs.push(`la validité (${d.validite}) précède la date du devis (${d.date}).`);
  if (ecart(d.date, ev.debut) < 0) alertes.push('l’événement est antérieur à la date du devis.');
  if (ecart(d.validite, ev.debut) < 0) alertes.push('le devis reste valable après le début de l’événement.');

  for (const id of d.ateliers || []) {
    if (!parId[id]) erreurs.push(`atelier inconnu : « ${id} » (voir les id de assets/js/ateliers.js).`);
    else if (!parId[id].actif) erreurs.push(`atelier « ${id} » retiré du site (actif: false).`);
  }
  // Présents nommés : chaque animation proposée doit avoir quelqu'un pour l'animer.
  if (d.presents?.length) {
    const cv = couverture(d.presents, ateliers, asso.defauts.minimumParAtelier);
    if (cv.inconnus.length) erreurs.push(`présents inconnus du site : ${cv.inconnus.join(', ')} (voir les noms de assets/js/personnages.js).`);
    for (const id of [...(d.ateliers || []), ...(d.options || [])]) {
      const x = cv.par[id];
      if (x && !x.possible) erreurs.push(`« ${x.atelier.titre} » est proposé, mais ${x.qui.length ? `il faut ${x.faut} membres pour l'animer, il n'y a que ${x.qui.join(', ')}` : 'personne parmi les présents ne l’anime'}.`);
    }
    if (d.presents.length < (d.troupe?.minimum ?? 0)) alertes.push(`${d.presents.length} présents nommés pour un minimum garanti de ${d.troupe.minimum}.`);
  }

  const options = [];
  for (const id of d.options || []) {
    const tarif = asso.tarifs.options[id];
    if (!parId[id]) erreurs.push(`option inconnue : « ${id} ».`);
    else if (!tarif) erreurs.push(`option « ${id} » sans tarif dans association.json.`);
    else if (tarif.prixJour == null) erreurs.push(`option « ${id} » : prix à fixer dans association.json avant de la proposer.`);
    else options.push({ id, titre: parId[id].titre, jours: nbJours, prixJour: tarif.prixJour, montant: nbJours * tarif.prixJour, pourquoi: tarif.pourquoi, surface: tarif.surface || 0 });
  }

  // Déplacement, depuis le siège : inclus sous le seuil (100 km aller), au-delà
  // estimé pour le camion de la troupe (location, carburant, péages) et
  // toujours affiché, même offert. Les voitures des membres ne se facturent pas.
  const dep = { ...d.deplacement };
  const b = asso.deplacement;
  if (typeof dep.kmAller !== 'number') erreurs.push(`deplacement.kmAller n’est pas renseigné : distance aller depuis ${b.depart}.`);
  const inclus = typeof dep.kmAller === 'number' && dep.kmAller <= b.seuilKmInclus;
  if (!inclus && typeof dep.kmAller === 'number' && typeof dep.peagesAller !== 'number') erreurs.push(`deplacement.peagesAller n’est pas renseigné (péages aller en classe ${b.camion.classePeage}, 0 s’il n’y en a pas).`);
  const lignesDep = [];
  if (!inclus && !erreurs.length) {
    const km = 2 * dep.kmAller;
    const c = b.camion;
    if (c.location != null) lignesDep.push({ libelle: c.libelle, montant: arrondi(c.location) });
    lignesDep.push({ libelle: `Carburant du camion, ${km} km aller-retour à ${String(c.consoL100).replace('.', ',')} L/100 km`, montant: arrondi(km * c.consoL100 / 100 * b.carburantPrixLitre) });
    if (dep.peagesAller) lignesDep.push({ libelle: `Péages aller-retour, classe ${c.classePeage}`, montant: arrondi(2 * dep.peagesAller) });
  }
  const totalDep = arrondi(lignesDep.reduce((s, l) => s + l.montant, 0));
  const offert = dep.offert === true ? totalDep : typeof dep.offert === 'number' ? Math.min(dep.offert, totalDep) : 0;

  const prixJour = d.prestation?.prixJour ?? asso.tarifs.vieDeCampJour;
  const camp = nbJours * prixJour;
  const remise = d.remise?.montant ? arrondi(d.remise.montant) : 0;
  const total = arrondi(camp + totalDep - offert - remise);
  const totalOptions = arrondi(total + options.reduce((s, o) => s + o.montant, 0));
  if (total <= 0) erreurs.push('le total est nul ou négatif.');

  return { erreurs, alertes, nbJours, prixJour, camp, options, lignesDep, totalDep, offert, remise, total, totalOptions, depInclus: inclus };
}

// --- Mise en page -------------------------------------------------------------

const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const img = p => pathToFileURL(p).href;

function horaires(d, asso) {
  const ev = d.evenement;
  if (ev.horaires?.length) return ev.horaires.map(x => `Le ${jourLong(x.jour)}, de ${x.debut} à ${x.fin}`);
  const liste = [];
  for (let i = 0; i <= ecart(ev.debut, ev.fin); i++) {
    const j = ajouterJours(ev.debut, i);
    liste.push(`Le ${jourLong(j)}, de ${asso.defauts.horaires.debut} à ${asso.defauts.horaires.fin}`);
  }
  return liste;
}

// Les clauses viennent de association.json (conditions), pour en changer la
// formulation sans toucher au code ; {contact} et {telephone} désignent le
// responsable du camp le jour même (contactJourJ de la fiche).
function conditionsGenerales(d, asso) {
  const qui = d.contactJourJ?.nom ? d.contactJourJ : asso.association.contact;
  return [...(asso.conditions || []), ...(d.conditions || [])].map(x => ({
    titre: x.titre,
    texte: x.texte.replace('{contact}', qui.nom).replace('{telephone}', qui.telephone.replace(/ /g, ' '))
  }));
}

function page(d, c, asso, ateliers) {
  const a = asso.association, ev = d.evenement, t = d.troupe, acc = d.accueil;
  const parId = Object.fromEntries(ateliers.map(x => [x.id, x]));
  const presentes = (d.ateliers || []).filter(id => !(d.options || []).includes(id)).map(id => parId[id]);
  const enOption = c.options.map(o => ({ ...parId[o.id], tarif: o }));
  const forge = c.options.find(o => o.surface);
  const surfaceOptions = c.options.reduce((s, o) => s + o.surface, 0);

  const carte = (x, option) => `
        <li class="atelier${option ? ' en-option' : ''}">
          ${x.img.includes('photo-a-venir') ? '<span class="vignette vide"></span>' : `<img class="vignette" src="${img(path.join(RACINE, x.img))}" alt="">`}
          <div><strong>${h(x.titre)}${option ? ' <span class="pastille">Option</span>' : ''}</strong>
          <span>${h(option ? `${x.resume} En option : ${x.tarif.pourquoi}.` : x.resume)}</span></div>
        </li>`;

  const conditions = [
    `Un terrain en herbe ou en terre, d’au moins ${acc.surfaceCamp} m² pour le camp, ${acc.surfaceCombat} m² pour la zone de combat${surfaceOptions ? ` et ${surfaceOptions} m² pour ${forge ? 'la forge' : 'les options'}` : ''}. Les tentes se plantent dans le sol : pas de goudron ni de dalle.`,
    `Un point d’eau à moins de ${acc.eauDistance} m et ${acc.bois} de bois pour la cuisine.`,
    acc.bottesPaille ? `${acc.bottesPaille} bottes de paille pour délimiter le camp et la lice (nous apportons piquets et cordages).` : null,
    acc.sanitaires ? 'L’accès à des sanitaires à proximité du camp.' : null,
    acc.surveillanceNuit ? 'Une surveillance du camp la nuit, contre les vols et les incivilités.' : null,
    ...(acc.autres || [])
  ].filter(Boolean);

  const ligne = (libelle, qte, pu, montant, classe = '') => `<tr class="${classe}"><td>${libelle}</td><td>${qte}</td><td>${pu}</td><td>${montant}</td></tr>`;
  const lignes = [
    ev.defile ? ligne('Défilé avec les troupes', '1', 'Inclus', euros(0)) : '',
    ligne('Vie de camp avec animations', `${c.nbJours} jour${c.nbJours > 1 ? 's' : ''}`, euros(c.prixJour), euros(c.camp)),
    c.depInclus
      ? ligne(`Frais de déplacement <em>(moins de ${asso.deplacement.seuilKmInclus} km de ${h(asso.deplacement.depart)})</em>`, '—', 'Inclus', euros(0))
      : ligne('Frais de déplacement, estimés <sup>1</sup>', '—', '—', euros(c.totalDep)),
    c.offert ? ligne(c.offert === c.totalDep ? 'Déplacement offert par l’association' : 'Part du déplacement offerte par l’association', '', '', euros(-c.offert), 'geste') : '',
    ligne('Repas des membres', '—', 'Inclus', euros(0)),
    c.remise ? ligne(h(d.remise.libelle || 'Remise'), '', '', euros(-c.remise), 'geste') : '',
    ligne('Montant de la prestation', '', '', euros(c.total), 'total'),
    ...c.options.map(o => ligne(`Option ${h(o.titre.toLowerCase())} <em>(facultative, à rayer si non souhaitée)</em>`, `${o.jours} jour${o.jours > 1 ? 's' : ''}`, euros(o.prixJour), euros(o.montant))),
    c.options.length ? ligne('Montant avec option' + (c.options.length > 1 ? 's' : ''), '', '', euros(c.totalOptions), 'total') : ''
  ].join('\n');

  const photosBandeau = BANDEAU.map(n => path.join(RACINE, 'assets/img/full', `${n}.webp`)).filter(p => fs.existsSync(p));

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Devis ${h(d.numero)} — ${h(ev.titre)}</title>
<link rel="stylesheet" href="${img(GABARIT)}">
</head>
<body>
<header class="entete">
  <img class="logo" src="${img(path.join(RACINE, 'assets/img/ecusson-epee-chaudron.webp'))}" alt="">
  <div class="nom">
    <strong>${h(a.nom)}</strong>
    <span>${h(a.forme)} · mesnie de reconstitution médiévale</span>
  </div>
  <address>
    ${a.adresse.map(h).join('<br>')}<br>
    ${h(a.contact.nom)} · ${h(a.contact.telephone)}<br>
    ${h(a.email)} · ${h(a.site.replace(/^https?:\/\//, ''))}<br>
    SIRET ${h(a.siret)} · RNA ${h(a.rna)}
  </address>
</header>

<section class="references">
  <div>
    <p class="etiquette">Devis n° ${h(d.numero)}</p>
    <p>${h(a.signataire.lieu)}, le ${dateLongue(d.date)}<br>Valable jusqu’au ${dateLongue(d.validite)}</p>
  </div>
  <div class="destinataire">
    <p class="etiquette">À l’attention de</p>
    <p><strong>${h(d.client.nom)}</strong>${d.client.attention ? `<br>${h(d.client.attention)}` : ''}${(d.client.adresse || []).map(l => `<br>${h(l)}`).join('')}</p>
  </div>
</section>

<h1>${h(ev.titre)}</h1>
<p class="quand">${periode(ev.debut, ev.fin)[0].toUpperCase() + periode(ev.debut, ev.fin).slice(1)}${ev.lieu ? ` · ${h(ev.lieu)}` : ''}</p>

<div class="bandeau">${photosBandeau.map(p => `<img src="${img(p)}" alt="">`).join('')}</div>

<h2><span>1</span> La prestation</h2>
<p>${h(a.nom)} est une association loi 1901 des Alpes-Maritimes qui réunit des passionnés de reconstitution historique autour de la vie de camp d’une mesnie. Ses deux thèmes majeurs sont le combat, à travers les arts martiaux historiques européens, et la cuisine médiévale, avec ses techniques et ses ingrédients. Costumes, armes et arts de la table couvrent du XIIIe au XVe siècle${ev.siecle ? ` ; pour cette fête, le camp sera centré sur le ${h(ev.siecle)}` : ''}.</p>
<p>Le camp vit en continu : on y cuisine, on y travaille, on y explique les gestes, et le public observe, questionne et participe. Voici ce que la mesnie présentera :</p>
<ul class="ateliers">${presentes.map(x => carte(x, false)).join('')}${enOption.map(x => carte(x, true)).join('')}
</ul>
<p class="renvoi">Photos et fiches détaillées des animations : <strong>${h(a.site.replace(/^https?:\/\//, ''))}</strong></p>

<h2><span>2</span> Notre engagement</h2>
<p>Chaque membre a sa spécialité : les animations présentées dépendent des membres présents.</p>
<ul class="puces">
  ${ev.installation || ev.defile ? `<li>${[ev.installation ? `Installation du camp ${h(ev.installation)}` : '', ev.defile ? 'participation au défilé des troupes' : ''].filter(Boolean).join(', ').replace(/^./, x => x.toUpperCase())}.</li>` : ''}
  <li>Camp ouvert au public et animations : ${horaires(d, asso).map(x => h(x.charAt(0).toLowerCase() + x.slice(1))).join(' ; ')}.</li>
  <li>Au moins ${t.minimum} membres en costume, jusqu’à ${t.maximum} selon les disponibilités. La mesnie peut inviter sur son camp cuisinières itinérantes, combattants en mal de défis ou saltimbanques.</li>
  <li>Le camp : ${t.tentes} tentes, un auvent de cuisine avec ses chaudrons et sa table à feu, un râtelier d’armes et une lice pour les combats. Nous vivons sur place, nous y dormons, cuisinons et mangeons : nos repas sont compris dans le prix.</li>
</ul>

<h2><span>3</span> À prévoir par l’organisateur</h2>
<ol class="conditions">${conditions.map(x => `<li>${h(x)}</li>`).join('')}</ol>

<section class="chiffrage">
<h2><span>4</span> Montant</h2>
<table>
  <thead><tr><th>Description</th><th>Quantité</th><th>Prix unitaire</th><th>Montant</th></tr></thead>
  <tbody>
${lignes}
  </tbody>
</table>
${c.depInclus ? '' : `<p class="note"><sup>1</sup> Estimation au départ de ${h(asso.deplacement.depart)}, ${d.deplacement.kmAller} km aller${d.deplacement.source ? ` (${h(d.deplacement.source)})` : ''} : ${c.lignesDep.map(l => `${h(l.libelle.charAt(0).toLowerCase() + l.libelle.slice(1))}, ${euros(l.montant)}`).join(' ; ')}.</p>`}
<p class="note">${h(a.tva)}</p>

<h2><span>5</span> Conditions</h2>
<ul class="clauses">${conditionsGenerales(d, asso).map(x => `<li><strong>${h(x.titre)}.</strong> ${h(x.texte)}</li>`).join('')}</ul>

<div class="signatures">
  <div>
    <p class="etiquette">Pour ${h(a.nom)}</p>
    <p>${h(a.signataire.nom)}<br>${h(a.signataire.lieu)}, le ${dateLongue(d.date)}</p>
    <img class="signature" src="${img(path.join(PRIVE, a.signataire.signature))}" alt="">
  </div>
  <div>
    <p class="etiquette">Pour l’organisateur</p>
    <p>Date, signature et cachet,<br>précédés de la mention « Lu et approuvé, bon pour accord »</p>
  </div>
</div>
</section>
</body>
</html>
`;
}

// --- Fabrication --------------------------------------------------------------

async function pdf(html, sortie, numero, nom) {
  const { chromium } = await import('playwright-core');
  let navigateur;
  for (const channel of ['msedge', 'chrome']) {
    try { navigateur = await chromium.launch({ channel, args: ['--allow-file-access-from-files'] }); break; } catch { /* on essaie le suivant */ }
  }
  if (!navigateur) stop('Ni Edge ni Chrome trouvé pour fabriquer le PDF.');
  const p = await navigateur.newPage();
  await p.goto(pathToFileURL(html).href, { waitUntil: 'load' });
  // Une image introuvable (logo déplacé, photo renommée) laisserait un cadre
  // vide dans le PDF : on refuse plutôt que d'envoyer ça à un client.
  const manquantes = await p.evaluate(() => [...document.images].filter(im => !im.naturalWidth).map(im => decodeURI(im.src)));
  if (manquantes.length) {
    await navigateur.close();
    stop(`Image${manquantes.length > 1 ? 's' : ''} introuvable${manquantes.length > 1 ? 's' : ''} :\n  ${manquantes.join('\n  ')}`);
  }
  // Chromium imprime les images décompressées (20 Mo pour un devis) : chaque
  // image repasse en JPEG, au double de sa taille d'affichage.
  await p.evaluate(() => Promise.all([...document.images].map(async im => {
    if (!im.naturalWidth) return;
    const k = Math.min(1, (2 * im.clientWidth) / im.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(im.naturalWidth * k);
    c.height = Math.round(im.naturalHeight * k);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    im.src = c.toDataURL('image/jpeg', 0.82);
    await im.decode();
  })));
  await p.pdf({
    path: sortie, format: 'A4', printBackground: true,
    margin: { top: '14mm', bottom: '16mm', left: '15mm', right: '15mm' },
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font:8px Segoe UI,Arial,sans-serif;color:#6a6257;padding:0 15mm;display:flex;justify-content:space-between"><span>${h(nom)} · devis n° ${h(numero)}</span><span>page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`
  });
  await navigateur.close();
}

async function generer(fichier) {
  fichier = path.resolve(fichier);
  horsDuDepot(fichier);
  if (!fs.existsSync(fichier)) stop(`Fiche introuvable : ${fichier}`);
  const asso = lireAssociation();
  const ateliers = lireAteliers();
  const d = lireJson(fichier);
  const c = calculer(d, asso, ateliers);
  for (const a of c.alertes) console.warn(`! ${a}`);
  if (c.erreurs.length) stop(`Fiche à compléter :\n  - ${c.erreurs.join('\n  - ')}`);

  const base = fichier.replace(/\.json$/, '');
  const sortie = `${base}.pdf`;
  // Un PDF du même nom fait à la main (avant l'outil) n'est jamais écrasé.
  if (fs.existsSync(sortie) && !d.genereLe) stop(`${sortie} existe et n'a pas été fait par cet outil : renommer la fiche ou le PDF.`);
  fs.writeFileSync(`${base}.html`, page(d, c, asso, ateliers));
  await pdf(`${base}.html`, sortie, d.numero, asso.association.nom);
  d.genereLe = new Date().toISOString().slice(0, 16).replace('T', ' ');
  d.montants = { prestation: c.total, avecOptions: c.options.length ? c.totalOptions : undefined, deplacementEstime: c.totalDep, deplacementOffert: c.offert };
  fs.writeFileSync(fichier, `${JSON.stringify(d, null, 2)}\n`);

  console.log(`✓ ${sortie}`);
  console.log(`  ${d.numero} · ${d.client.nom} · ${d.evenement.titre}, ${periode(d.evenement.debut, d.evenement.fin)}`);
  console.log(`  Vie de camp ${c.nbJours} × ${euros(c.prixJour)} = ${euros(c.camp)}`);
  console.log(c.depInclus ? `  Déplacement inclus (${d.deplacement.kmAller} km, moins de ${asso.deplacement.seuilKmInclus} km)` : `  Déplacement estimé ${euros(c.totalDep)}${c.offert ? `, offert ${euros(c.offert)}` : ', facturé'}`);
  if (c.remise) console.log(`  Remise ${euros(c.remise)}`);
  console.log(`  Montant ${euros(c.total)}${c.options.length ? ` · avec option${c.options.length > 1 ? 's' : ''} ${euros(c.totalOptions)}` : ''}`);
}

function equipe(texte) {
  const presents = texte.split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
  if (!presents.length) stop('npm run devis -- equipe "<Nom>, <Nom>, …"');
  const asso = lireAssociation();
  const cv = couverture(presents, lireAteliers(), asso.defauts.minimumParAtelier);
  if (cv.inconnus.length) console.log(`? Inconnus du site : ${cv.inconnus.join(', ')}`);
  console.log(`Présents : ${cv.venus.map(m => `${m.nom} (${[...m.roles].join(', ')})`).join(' · ') || 'aucun reconnu'}`);
  const lignes = Object.values(cv.par);
  const option = x => asso.tarifs.options[x.atelier.id] ? ' [option]' : '';
  console.log('\nPossible :');
  for (const x of lignes.filter(x => x.possible)) console.log(`  ✓ ${x.atelier.id.padEnd(18)} ${x.atelier.titre}${option(x)} — ${x.collectif ? 'collectif' : x.qui.join(', ')}`);
  const non = lignes.filter(x => !x.possible);
  console.log('\nPas possible sans d’autres membres :');
  if (!non.length) console.log('  (rien)');
  const membres = [...lireMembres().values()];
  for (const x of non) console.log(`  ✗ ${x.atelier.id.padEnd(18)} ${x.atelier.titre}${option(x)} — ${x.qui.length ? `${x.faut} membres nécessaires, présent : ${x.qui.join(', ')} ; ` : ''}animé par ${membres.filter(m => m.ateliers.has(x.atelier.id)).map(m => m.nom).join(', ')}`);
  console.log(`\n${cv.venus.length} présent${cv.venus.length > 1 ? 's' : ''} reconnu${cv.venus.length > 1 ? 's' : ''} ; minimum garanti habituel : ${asso.defauts.troupe.minimum}.`);
}

function liste() {
  const tous = devisExistants();
  if (!tous.length) return console.log('Aucun devis fait avec cet outil pour l’instant.');
  for (const { devis: d } of tous) {
    const m = d.montants ? euros(d.montants.avecOptions ?? d.montants.prestation) : 'non généré';
    console.log(`${d.numero}  ${d.client?.nom || '?'} · ${d.evenement?.titre || '?'} (${d.evenement?.debut || '?'}) · ${m}`);
  }
}

const [commande, ...args] = process.argv.slice(2);
if (commande === 'nouveau') nouveau(args[0], args[1]);
else if (commande === 'liste') liste();
else if (commande === 'equipe') equipe(args.join(' '));
else if (commande) await generer(commande);
else console.log('npm run devis -- nouveau "<Ville>" [<année>]  |  npm run devis -- "<fiche.json>"  |  npm run devis -- liste  |  npm run devis -- equipe "<Nom>, <Nom>"');
