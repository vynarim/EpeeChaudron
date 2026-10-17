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
//       Personnage ou vrai prénom (glossaire membres de association.json).
//   npm run devis -- note "<chemin du .md>"
//       Met en page une note d'intention écrite en Markdown à côté de la
//       fiche, avec l'en-tête du devis : .html et .pdf à côté.
//
// Fiche : une prestation (evenement.debut/fin) ou plusieurs formules au
// choix (formules), chiffrées côte à côte. brouillon : filigrane, pas de
// signature, « sous réserve des membres ». accueil.sol : herbe, terre,
// goudron, paves ou a-definir (clause des clous d'arpentage).
// accueil.hebergement : { surPlace, aLoger }. remise : { libelle, pourcent }
// ou { libelle, montant }.
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

// Photos du bandeau, dans l'ordre : le camp, la cuisine, les armes. Pas de
// photo de plusieurs combattants en armure : la troupe en aligne rarement
// autant, le devis ne doit pas le promettre.
const BANDEAU = ['accueil-troupe-camp', 'galerie-cuisine-foyer', 'galerie-armes-ratelier'];
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
// Le socle (association.json) est toujours possible : on est sûr d'avoir
// quelqu'un, ou la troupe le fait systématiquement.
// Un présent se nomme par son personnage ou par son vrai prénom : le glossaire
// prénom → personnage (membres de association.json) reste privé.
function couverture(presents, ateliers, minimum = {}, socle = [], glossaire = {}) {
  const membres = lireMembres();
  const alias = Object.fromEntries(Object.entries(glossaire).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [sansAccent(k), v]));
  const inconnus = [], venus = [];
  for (const n of presents) {
    const m = membres.get(sansAccent(n)) || membres.get(sansAccent(alias[sansAccent(n)] || ''));
    if (m && !venus.includes(m)) venus.push(m); else if (!m) inconnus.push(n);
  }
  const animes = new Set([...membres.values()].flatMap(m => [...m.ateliers]));
  const par = {};
  for (const a of ateliers.filter(x => x.actif)) {
    const collectif = !animes.has(a.id);
    const qui = venus.filter(m => m.ateliers.has(a.id)).map(m => m.nom);
    const faut = minimum[a.id] || 1;
    const deBase = socle.includes(a.id);
    par[a.id] = { atelier: a, collectif, socle: deBase, qui, faut, possible: deBase || collectif || qui.length >= faut };
  }
  return { inconnus, venus, par };
}

// Les animations présentées : le socle d'abord, dans son ordre (sans le
// défilé si la fête n'en a pas), puis celles ajoutées à la fiche, dans
// l'ordre du site. Les options viennent à part.
function animationsDuDevis(d, asso, ateliers) {
  const options = d.options || [];
  const socle = (asso.socle || []).filter(id => !(id === 'defile' && d.evenement?.defile === false));
  const demandees = [...(d.ateliers || []), ...formulesDe(d).flatMap(f => f.ateliers)];
  const ajoutees = ateliers.map(a => a.id).filter(id => demandees.includes(id) && !socle.includes(id) && !options.includes(id));
  return [...socle, ...ajoutees].filter(id => !options.includes(id));
}

// Une fiche chiffre une seule prestation (evenement.debut/fin) ou plusieurs
// formules au choix (formules : A essentielle, B avec soirée, C week-end…),
// quand l'organisateur hésite sur l'ampleur. Les ateliers communs à toutes
// les formules restent dans ateliers ; chaque formule ajoute les siens.
function formulesDe(d) {
  const ev = d.evenement || {};
  if (!d.formules?.length) return [{ lettre: '', nom: '', debut: ev.debut, fin: ev.fin, horaires: ev.horaires || [], soiree: ev.soiree, ateliers: d.ateliers || [] }];
  return d.formules.map((f, i) => ({
    ...f,
    lettre: f.lettre || String.fromCharCode(65 + i),
    horaires: f.horaires || [],
    ateliers: [...new Set([...(d.ateliers || []), ...(f.ateliers || [])])]
  }));
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

  const fiche = {
    numero: `${prefixe}-${String(rang).padStart(3, '0')}`,
    date: aujourdhui,
    validite: ajouterJours(aujourdhui, asso.tarifs.validiteJours),
    client: { nom: '', attention: '', adresse: [] },
    evenement: { titre: '', lieu: '', debut: '', fin: '', installation: '', defile: true, siecle: '', horaires: [] },
    prestation: { prixJour: asso.tarifs.vieDeCampJour },
    presents: [],
    ateliers: [],
    options: [],
    troupe: { ...asso.defauts.troupe },
    brouillon: false,
    accueil: { ...asso.defauts.accueil, sol: 'herbe', hebergement: null, autres: [] },
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

  const formules = formulesDe(d);
  if (!d.client?.nom) erreurs.push('client.nom est vide.');
  if (!ev.titre) erreurs.push('evenement.titre est vide.');
  for (const f of formules) if (!f.debut || !f.fin) erreurs.push(`${f.lettre ? `formule ${f.lettre} : debut et fin` : 'evenement.debut et evenement.fin'} sont obligatoires (AAAA-MM-JJ).`);
  if (d.formules?.length && formules.some(f => !f.nom)) erreurs.push('chaque formule a besoin d’un nom (« Essentielle », « Week-end »…).');
  // Une soirée seule n'est pas une vie de camp : ni tente ni cuisine, des
  // animations en costume (defauts.formats de association.json). Pas de tarif.
  if (formules.some(f => f.soireeSeule)) erreurs.push('soirée seule : pas de tarif ni de mise en page pour ce format (ni tente ni cuisine) ; à fixer avec l’utilisateur avant de la chiffrer.');
  if (erreurs.length) return { erreurs, alertes };

  for (const f of formules) if (ecart(f.debut, f.fin) < 0) erreurs.push(`${f.lettre ? `formule ${f.lettre} : ` : ''}la fin précède le début.`);
  const premier = formules.map(f => f.debut).sort()[0];
  if (ecart(d.date, d.validite) < 0) erreurs.push(`la validité (${d.validite}) précède la date du devis (${d.date}).`);
  if (ecart(d.date, premier) < 0) alertes.push('l’événement est antérieur à la date du devis.');
  if (ecart(d.validite, premier) < 0) alertes.push('le devis reste valable après le début de l’événement.');

  // Première version d'un devis sur demande ouverte : tout est « sous réserve
  // des membres disponibles », une option sans animateur connu avertit au lieu
  // de bloquer.
  const sousReserve = d.sousReserve ?? d.brouillon === true;

  for (const id of asso.socle || []) if (!parId[id]?.actif) erreurs.push(`socle : « ${id} » inconnu ou retiré du site (association.json).`);
  for (const id of new Set(formules.flatMap(f => f.ateliers))) {
    if (!parId[id]) erreurs.push(`atelier inconnu : « ${id} » (voir les id de assets/js/ateliers.js).`);
    else if (!parId[id].actif) erreurs.push(`atelier « ${id} » retiré du site (actif: false).`);
    // Une animation à supplément n'apparaît que comme option : sa carte et sa
    // ligne du tableau vont ensemble, jamais l'une sans l'autre.
    else if (asso.tarifs.options[id] && !(d.options || []).includes(id)) erreurs.push(`« ${parId[id].titre} » est une option à supplément : la mettre dans options (carte + ligne au tableau), ou la retirer des ateliers.`);
  }
  // Présents nommés : chaque animation proposée doit avoir quelqu'un pour l'animer.
  if (d.presents?.length) {
    const cv = couverture(d.presents, ateliers, asso.defauts.minimumParAtelier, asso.socle, asso.membres);
    if (cv.inconnus.length) erreurs.push(`présents inconnus : ${cv.inconnus.join(', ')} (ni personnage de assets/js/personnages.js, ni prénom du glossaire membres de association.json).`);
    for (const id of new Set(formules.flatMap(f => f.ateliers))) {
      const x = cv.par[id];
      if (x && !x.possible) erreurs.push(`« ${x.atelier.titre} » est proposé, mais ${x.qui.length ? `il faut ${x.faut} membres pour l'animer, il n'y a que ${x.qui.join(', ')}` : 'personne parmi les présents ne l’anime'}.`);
    }
    for (const id of d.options || []) {
      const x = cv.par[id];
      if (x && !x.possible) (sousReserve ? alertes : erreurs).push(`option « ${x.atelier.titre} » : personne parmi les présents ne l’anime${sousReserve ? ' (devis sous réserve des membres : affichée quand même)' : ''}.`);
    }
    if (cv.venus.length < (d.troupe?.minimum ?? 0)) alertes.push(`${cv.venus.length} présents nommés pour un minimum garanti de ${d.troupe.minimum}.`);
  }

  const tarifsOptions = [];
  for (const id of d.options || []) {
    const tarif = asso.tarifs.options[id];
    if (!parId[id]) erreurs.push(`option inconnue : « ${id} ».`);
    else if (!tarif) erreurs.push(`option « ${id} » sans tarif dans association.json.`);
    else if (tarif.prixJour == null) erreurs.push(`option « ${id} » : prix à fixer dans association.json avant de la proposer.`);
    else tarifsOptions.push({ id, titre: parId[id].titre, prixJour: tarif.prixJour, pourquoi: tarif.pourquoi, surface: tarif.surface || 0, lieu: tarif.lieu });
  }
  if (d.remise?.montant && d.remise?.pourcent) erreurs.push('remise : montant ou pourcent, pas les deux.');
  if (formules.length > 1 && d.remise?.montant) erreurs.push('remise : avec plusieurs formules, l’exprimer en pourcent (elle s’applique à chacune).');

  // Déplacement, depuis le siège : inclus sous le seuil (100 km aller), au-delà
  // forfait calculé pour le camion de la troupe (location, carburant, péages) et
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
    lignesDep.push({ libelle: `Carburant (${km} km aller-retour)`, montant: arrondi(km * c.consoL100 / 100 * b.carburantPrixLitre) });
    if (dep.peagesAller) lignesDep.push({ libelle: `Péages aller-retour (classe ${c.classePeage})`, montant: arrondi(2 * dep.peagesAller) });
  }
  // Un forfait, pas une estimation : calculé une fois, arrondi à la dizaine
  // supérieure (deplacement.arrondi), jamais refacturé au réel.
  const pas = b.arrondi || 1;
  const calcule = lignesDep.reduce((s, l) => s + l.montant, 0);
  const totalDep = Math.ceil(calcule / pas - 1e-9) * pas;
  const offert = dep.offert === true ? totalDep : typeof dep.offert === 'number' ? Math.min(dep.offert, totalDep) : 0;

  // Chaque formule : ses jours, sa vie de camp, sa remise, ses options au
  // nombre de jours. Le déplacement est le même pour toutes (un seul camion).
  // La journée type va de 10h à 18h. Une soirée un jour où l'on dort déjà sur
  // place (samedi d'un week-end) ne coûte rien de plus. Une soirée le dernier
  // jour, c'est le camp qu'on ne démonte pas : nuit sur place, hébergement,
  // camion un jour de plus, démontage le lendemain ; elle compte comme une
  // journée (tarifs.soireeDernierJourEnJours de association.json).
  const prixJour = d.prestation?.prixJour ?? asso.tarifs.vieDeCampJour;
  const chiffrees = formules.map(f => {
    const nbJours = ecart(f.debut, f.fin) + 1;
    const camp = nbJours * prixJour;
    const soireeFinale = !!f.soiree && (f.soiree.jour || f.fin) === f.fin;
    if (soireeFinale && asso.tarifs.soireeDernierJourEnJours == null) erreurs.push(`${f.lettre ? `formule ${f.lettre} : ` : ''}soirée le dernier jour, mais tarifs.soireeDernierJourEnJours n’est pas fixé dans association.json.`);
    const soireeMontant = soireeFinale ? arrondi((asso.tarifs.soireeDernierJourEnJours || 0) * prixJour) : 0;
    const base = camp + soireeMontant;
    const remise = d.remise?.pourcent ? arrondi(base * d.remise.pourcent / 100) : d.remise?.montant ? arrondi(d.remise.montant) : 0;
    const total = arrondi(base + totalDep - offert - remise);
    const options = tarifsOptions.map(o => ({ ...o, jours: nbJours, montant: nbJours * o.prixJour }));
    const totalOptions = arrondi(total + options.reduce((s, o) => s + o.montant, 0));
    if (total <= 0) erreurs.push(`${f.lettre ? `formule ${f.lettre} : ` : ''}le total est nul ou négatif.`);
    // Une journée : camp léger (formats.journee de association.json), monté le
    // matin même si la fête est proche, pour éviter une nuit de plus ; la
    // veille sinon. Plusieurs jours : camp complet, monté la veille.
    const journee = asso.defauts.formats?.journee || {};
    const tentes = f.tentes ?? (nbJours === 1 && journee.tentes ? journee.tentes : d.troupe?.tentes);
    const installation = f.installation || ev.installation || (nbJours === 1 && inclus ? 'le matin même, prêt pour l’ouverture au public' : 'la veille en fin d’après-midi');
    const demontage = soireeFinale ? 'nuit sur place après la soirée, démontage le lendemain matin' : '';
    return { ...f, nbJours, camp, soireeFinale, soireeMontant, remise, total, options, totalOptions, tentes, installation, demontage };
  });

  // La première formule garde les noms à plat : le devis simple s'en sert.
  return { erreurs, alertes, sousReserve, prixJour, formules: chiffrees, lignesDep, totalDep, offert, depInclus: inclus, ...chiffrees[0] };
}

// --- Mise en page -------------------------------------------------------------

const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const img = p => pathToFileURL(p).href;

// Les horaires d'une formule (ou de la prestation), jour par jour. Une soirée
// ({ jour?, debut, fin, programme }) s'ajoute au dernier jour, ou au jour dit.
function horaires(f, asso) {
  const liste = [];
  if (f.horaires?.length) for (const x of f.horaires) liste.push({ jour: x.jour, texte: `le ${jourLong(x.jour)}, de ${x.debut} à ${x.fin}` });
  else for (let i = 0; i <= ecart(f.debut, f.fin); i++) {
    const j = ajouterJours(f.debut, i);
    liste.push({ jour: j, texte: `le ${jourLong(j)}, de ${asso.defauts.horaires.debut} à ${asso.defauts.horaires.fin}` });
  }
  if (f.soiree) {
    const jourSoiree = f.soiree.jour || f.fin;
    const x = liste.find(l => l.jour === jourSoiree);
    const soir = `puis en soirée de ${f.soiree.debut} à ${f.soiree.fin}${f.soiree.programme ? ` (${f.soiree.programme})` : ''}`;
    if (x) x.texte += `, ${soir}`; else liste.push({ jour: jourSoiree, texte: `le ${jourLong(jourSoiree)}, en soirée de ${f.soiree.debut} à ${f.soiree.fin}` });
  }
  return liste.map(l => l.texte);
}

// Les clauses viennent de association.json (conditions), pour en changer la
// formulation sans toucher au code ; {contact} et {telephone} désignent le
// responsable du camp le jour même (contactJourJ de la fiche).
function conditionsGenerales(d, asso) {
  const qui = d.contactJourJ?.nom ? d.contactJourJ : asso.association.contact;
  const solDur = ['goudron', 'paves', 'a-definir'].includes(d.accueil?.sol) && asso.conditionSolDur ? [asso.conditionSolDur] : [];
  return [...(asso.conditions || []), ...solDur, ...(d.conditions || [])].map(x => ({
    titre: x.titre,
    texte: x.texte.replace('{contact}', qui.nom).replace('{telephone}', qui.telephone.replace(/ /g, ' '))
  }));
}

function page(d, c, asso, ateliers) {
  const a = asso.association, ev = d.evenement, t = d.troupe, acc = d.accueil;
  const parId = Object.fromEntries(ateliers.map(x => [x.id, x]));
  const presentes = animationsDuDevis(d, asso, ateliers).map(id => parId[id]);
  const enOption = c.options.map(o => ({ ...parId[o.id], tarif: o }));
  // Chaque option qui demande sa place l'annonce : « 30 m² pour la forge ».
  const places = c.options.filter(o => o.surface).map(o => `${o.surface} m² pour ${o.lieu || o.titre.toLowerCase()} (option)`);
  // Plusieurs formules : une animation qui n'est pas dans toutes porte les
  // lettres des formules qui la comprennent.
  const multi = c.formules.length > 1;
  const quand = periode(c.formules.map(f => f.debut).sort()[0], c.formules.map(f => f.fin).sort().at(-1));
  const socle = asso.socle || [];
  const lettres = id => {
    if (!multi || socle.includes(id)) return '';
    const dans = c.formules.filter(f => f.ateliers.includes(id)).map(f => f.lettre);
    return dans.length === c.formules.length ? '' : `Formule${dans.length > 1 ? 's' : ''} ${dans.join(', ')}`;
  };

  const carte = (x, option) => `
        <li class="atelier${option ? ' en-option' : ''}">
          ${x.img.includes('photo-a-venir') ? '<span class="vignette vide"></span>' : `<img class="vignette" src="${img(path.join(RACINE, x.img))}" alt="">`}
          <div><strong>${h(x.titre)}${option ? ' <span class="pastille">Option</span>' : lettres(x.id) ? ` <span class="pastille formule">${lettres(x.id)}</span>` : ''}</strong>
          <span>${h(x.resume)}</span></div>
        </li>`;

  // Le sol : en herbe ou en terre, les tentes se plantent ; sur goudron ou
  // pavés, il faut l'accord de planter des clous d'arpentage (clause solDur
  // de association.json). « a-definir » : herbe souhaitée, sol dur possible.
  const sol = acc.sol || 'herbe';
  const surfaces = `d’au moins ${acc.surfaceCamp} m² pour le camp, ${[`${acc.surfaceCombat} m² pour la zone de combat`, ...places].join(', ').replace(/, ([^,]*)$/, ' et $1')}`;
  const terrain = {
    herbe: `Un terrain en herbe ou en terre, ${surfaces}. Les tentes se plantent dans le sol : pas de goudron ni de dalle.`,
    terre: `Un terrain en herbe ou en terre, ${surfaces}. Les tentes se plantent dans le sol : pas de goudron ni de dalle.`,
    goudron: `Un emplacement ${surfaces}, sur l’enrobé : les tentes s’y tiennent avec des clous d’arpentage (voir Conditions).`,
    paves: `Un emplacement ${surfaces}, sur les pavés : les tentes s’y tiennent avec des clous d’arpentage plantés dans les joints (voir Conditions).`,
    'a-definir': `Un terrain ${surfaces}, de préférence en herbe ou en terre. Sur goudron ou pavés, les tentes se tiennent avec des clous d’arpentage (voir Conditions).`
  }[sol];
  if (!terrain) stop(`accueil.sol : « ${sol} » inconnu (herbe, terre, goudron, paves ou a-definir).`);
  const heb = acc.hebergement;

  const conditions = [
    terrain,
    `Un point d’eau à moins de ${acc.eauDistance} m et ${acc.bois} de bois pour la cuisine.`,
    acc.bottesPaille ? `${acc.bottesPaille} bottes de paille pour délimiter le camp et la lice (nous apportons piquets et cordages).` : null,
    acc.sanitaires ? 'L’accès à des sanitaires à proximité du camp.' : null,
    acc.surveillanceNuit ? 'Une surveillance du camp la nuit, contre les vols et les incivilités.' : null,
    acc.electricite ? 'Si possible, une prise électrique près du camp : en été, elle alimente nos glacières, cachées aux yeux du public.' : null,
    heb?.aLoger ? `Le logement de ${heb.aLoger} membres près du camp (gîte, chambres ou salle avec couchage), pour chaque nuit sur place, veille comprise.` : null,
    ...(acc.autres || [])
  ].filter(Boolean);

  const libelleRemise = h(`${d.remise?.libelle || 'Remise'}${d.remise?.pourcent && !/%/.test(d.remise.libelle || '') ? ` (${d.remise.pourcent} %)` : ''}`);
  const ligne = (libelle, qte, pu, montant, classe = '') => `<tr class="${classe}"><td>${libelle}</td><td>${qte}</td><td>${pu}</td><td>${montant}</td></tr>`;
  const lignes = [
    ev.defile ? ligne('Défilé avec les troupes', '1', 'Inclus', euros(0)) : '',
    ligne('Vie de camp avec animations <em>(repas des membres compris)</em>', `${c.nbJours} jour${c.nbJours > 1 ? 's' : ''}`, euros(c.prixJour), euros(c.camp)),
    c.soireeFinale ? ligne('Soirée du dernier jour <em>(nuit sur place et démontage le lendemain)</em>', '1', euros(c.soireeMontant), euros(c.soireeMontant)) : '',
    c.depInclus
      ? ligne(`Frais de déplacement <em>(moins de ${asso.deplacement.seuilKmInclus} km de ${h(asso.deplacement.depart)})</em>`, '—', 'Inclus', euros(0))
      : ligne('Forfait de déplacement <sup>1</sup>', '1', euros(c.totalDep), euros(c.totalDep)),
    c.offert ? ligne(c.offert === c.totalDep ? 'Forfait de déplacement offert par l’association' : 'Part du forfait de déplacement offerte par l’association', '', '', euros(-c.offert), 'geste') : '',
    c.remise ? ligne(libelleRemise, '', '', euros(-c.remise), 'geste') : '',
    ligne('Montant de la prestation', '', '', euros(c.total), 'total'),
    ...c.options.map(o => ligne(`Option ${h(o.titre.toLowerCase())} <em>(${h(o.pourquoi)})</em>`, `${o.jours} jour${o.jours > 1 ? 's' : ''}`, euros(o.prixJour), euros(o.montant))),
    c.options.length ? ligne('Montant avec option' + (c.options.length > 1 ? 's' : ''), '', '', euros(c.totalOptions), 'total') : ''
  ].join('\n');

  // Plusieurs formules : un tableau comparatif, une colonne par formule.
  const F = c.formules;
  const rang = (libelle, cellules, classe = '') => `<tr class="${classe}"><td>${libelle}</td>${cellules.map(x => `<td>${x}</td>`).join('')}</tr>`;
  const comparatif = !multi ? '' : `<table class="comparatif">
  <thead><tr><th>Description</th>${F.map(f => `<th>${h(f.lettre)} · ${h(f.nom)}</th>`).join('')}</tr></thead>
  <tbody>
${[
    rang('Durée', F.map(f => `${f.nbJours} jour${f.nbJours > 1 ? 's' : ''}${f.soiree ? ' + soirée' : ''}`)),
    ev.defile ? rang('Défilé avec les troupes', F.map(() => 'Inclus')) : '',
    rang(`Vie de camp avec animations <em>(${euros(c.prixJour)} par jour, repas des membres compris)</em>`, F.map(f => euros(f.camp))),
    F.some(f => f.soiree) ? rang(`Soirée${F.some(f => f.soireeFinale) ? ' <em>(le dernier jour : nuit sur place et démontage le lendemain, comptés comme une journée)</em>' : ''}`, F.map(f => (f.soireeFinale ? euros(f.soireeMontant) : f.soiree ? 'Incluse' : '—'))) : '',
    c.depInclus
      ? rang(`Frais de déplacement <em>(moins de ${asso.deplacement.seuilKmInclus} km de ${h(asso.deplacement.depart)})</em>`, F.map(() => 'Inclus'))
      : rang('Forfait de déplacement <sup>1</sup>', F.map(() => euros(c.totalDep))),
    c.offert ? rang(c.offert === c.totalDep ? 'Forfait de déplacement offert par l’association' : 'Part du forfait de déplacement offerte par l’association', F.map(() => euros(-c.offert)), 'geste') : '',
    c.remise ? rang(libelleRemise, F.map(f => euros(-f.remise)), 'geste') : '',
    rang('Montant de la prestation', F.map(f => euros(f.total)), 'total'),
    ...c.options.map((o, i) => rang(`Option ${h(o.titre.toLowerCase())} <em>(${euros(o.prixJour)} par jour : ${h(o.pourquoi)})</em>`, F.map(f => euros(f.options[i].montant)))),
    c.options.length ? rang(`Montant avec ${c.options.length > 1 ? 'toutes les options' : 'l’option'}`, F.map(f => euros(f.totalOptions)), 'total') : ''
  ].filter(Boolean).join('\n')}
  </tbody>
</table>`;

  const photosBandeau = BANDEAU.map(n => path.join(RACINE, 'assets/img/full', `${n}.webp`)).filter(p => fs.existsSync(p));

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Devis ${h(d.numero)} — ${h(ev.titre)}</title>
<link rel="stylesheet" href="${img(GABARIT)}">
</head>
<body${multi ? ' class="formules"' : ''}>
${d.brouillon ? '<div class="filigrane" aria-hidden="true">Projet · non contractuel</div>' : ''}
<header class="entete">
  <img class="logo" src="${img(path.join(RACINE, 'assets/img/ecusson-epee-chaudron.webp'))}" alt="">
  <div class="nom">
    <strong>${h(a.nom)}</strong>
    <span>${h(a.forme)} · mesnie de reconstitution médiévale</span>
    <span class="liens"><a href="mailto:${h(a.email)}">${h(a.email)}</a> · <a href="${h(a.site)}">${h(a.site.replace(/^https?:\/\//, ''))}</a></span>
  </div>
  <address>
    ${a.adresse.map(h).join('<br>')}<br>
    ${h(a.contact.nom)} · ${h(a.contact.telephone)}<br>
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
<p class="quand">${quand[0].toUpperCase() + quand.slice(1)}${multi ? `, en ${F.length} formules au choix` : ''}${ev.lieu ? ` · ${h(ev.lieu)}` : ''}</p>

<div class="bandeau">${photosBandeau.map(p => `<img src="${img(p)}" alt="">`).join('')}</div>

<h2><span>1</span> La prestation</h2>
<p>${h(a.nom)} est une association loi 1901 des Alpes-Maritimes qui réunit des passionnés de reconstitution historique autour de la vie de camp d’une mesnie. Ses deux thèmes majeurs sont le combat, à travers les arts martiaux historiques européens, et la cuisine médiévale, avec ses techniques et ses ingrédients. Costumes, armes et arts de la table couvrent du XIIIe au XVe siècle${ev.multiEpoque ? ' ; pour cette fête, la mesnie montrera plusieurs siècles côte à côte, pour que le public voie évoluer costumes et équipements' : ev.siecle ? ` ; pour cette fête, le camp sera centré sur le ${h(ev.siecle)}` : ''}.</p>
<p>Le camp vit en continu : on y cuisine, on y travaille, on y explique les gestes, et le public observe, questionne et participe. Voici ce que la mesnie présentera :</p>
<ul class="ateliers">${presentes.map(x => carte(x, false)).join('')}${enOption.map(x => carte(x, true)).join('')}
</ul>
<p class="renvoi">Photos et fiches détaillées des animations : <strong>${h(a.site.replace(/^https?:\/\//, ''))}</strong></p>
${multi ? `<div class="liste-formules">${F.map(f => `
  <div><p class="etiquette">Formule ${h(f.lettre)} · ${h(f.nom)}</p>
  <p>${h(f.resume || `${f.nbJours} jour${f.nbJours > 1 ? 's' : ''}${f.soiree ? ' et une soirée' : ''}.`)}</p></div>`).join('')}
</div>` : ''}

<h2><span>2</span> Notre engagement</h2>
<p>Chaque membre a sa spécialité : les animations présentées dépendent des membres présents.${c.sousReserve ? ' Cette première proposition est faite sous réserve de la disponibilité de nos membres aux dates retenues.' : ''}</p>
<ul class="puces">
  ${multi
    ? `${ev.defile ? '<li>Participation au défilé des troupes.</li>' : ''}
  <li>Installation, camp et horaires d’ouverture au public, selon la formule :<ul>${F.map(f => `<li><strong>${h(f.lettre)}</strong> : installation ${h(f.installation)}, ${f.tentes} tentes ; ouvert ${horaires(f, asso).map(h).join(' ; ')}${f.demontage ? ` ; ${h(f.demontage)}` : ''}.</li>`).join('')}</ul></li>`
    : `<li>${[`Installation du camp ${h(c.installation)}`, ev.defile ? 'participation au défilé des troupes' : ''].filter(Boolean).join(', ')}.</li>
  <li>Camp ouvert au public et animations : ${horaires(c, asso).map(h).join(' ; ')}${c.demontage ? ` ; ${h(c.demontage)}` : ''}.</li>`}
  ${F.some(f => f.soiree) ? `<li>Notre journée d’animation va de ${asso.defauts.horaires.debut} à ${asso.defauts.horaires.fin}. Une soirée reste exceptionnelle : le dernier jour, elle nous fait garder le camp monté, dormir sur place et démonter le lendemain.</li>` : ''}
  <li>Au moins ${t.minimum} membres en costume, jusqu’à ${t.maximum} selon les disponibilités. La mesnie peut inviter sur son camp cuisinières itinérantes, combattants en mal de défis ou saltimbanques.</li>
  <li>Le camp : ${multi ? 'ses tentes' : `${c.tentes} tentes`}, un auvent de cuisine avec ses chaudrons et sa table à feu, un râtelier d’armes et une lice pour les combats. ${!multi && c.nbJours === 1 && /matin/.test(c.installation) ? 'Nous vivons sur place : nous y cuisinons et mangeons, nos repas sont compris dans le prix.' : heb?.surPlace ? `Nous vivons sur place : nous y cuisinons et mangeons, et ${heb.surPlace} membres y dorment. Nos repas sont compris dans le prix.` : 'Nous vivons sur place, nous y dormons, cuisinons et mangeons : nos repas sont compris dans le prix.'}</li>
</ul>

<h2><span>3</span> À prévoir par l’organisateur</h2>
<ol class="conditions">${conditions.map(x => `<li>${h(x)}</li>`).join('')}</ol>

<section class="chiffrage">
<h2><span>4</span> Montant</h2>
${multi ? comparatif : `<table>
  <thead><tr><th>Description</th><th>Quantité</th><th>Prix unitaire</th><th>Montant</th></tr></thead>
  <tbody>
${lignes}
  </tbody>
</table>`}
${c.depInclus ? '' : `<p class="note"><sup>1</sup> Forfait ferme, non révisable, établi au départ de ${h(asso.deplacement.depart)} (${d.deplacement.kmAller} km aller)${multi ? ', le même pour chaque formule' : ''}. Il comprend : ${c.lignesDep.map(l => h(l.libelle.charAt(0).toLowerCase() + l.libelle.slice(1))).join(' ; ')}.</p>`}
<p class="note">${multi ? 'Une seule formule est retenue : la cocher ci-dessous. ' : ''}${c.options.length ? `Les options sont facultatives${multi ? ' et se comptent au nombre de jours de la formule' : ''} : rayer celles qui ne sont pas retenues avant de signer. ` : ''}${d.brouillon ? 'Document de travail : dates et programme indicatifs, à confirmer ensemble. ' : ''}${h(a.tva)}</p>

<h2><span>5</span> Conditions</h2>
<ul class="clauses">${conditionsGenerales(d, asso).map(x => `<li><strong>${h(x.titre)}.</strong> ${h(x.texte)}</li>`).join('')}</ul>

<div class="signatures">
  <div>
    <p class="etiquette">Pour ${h(a.nom)}</p>
    <p>${h(a.signataire.nom)}, ${h(a.signataire.lieu)}, le ${dateLongue(d.date)}</p>
    ${d.brouillon ? '<p class="note">Signature apposée sur la version définitive.</p>' : `<img class="signature" src="${img(path.join(PRIVE, a.signataire.signature))}" alt="">`}
  </div>
  <div>
    <p class="etiquette">Pour l’organisateur</p>
    ${multi ? `<p class="choix">Formule retenue : ${F.map(f => `<span>☐ ${h(f.lettre)}</span>`).join(' ')}</p>` : ''}
    <p>Date, signature et cachet,<br>précédés de la mention « Lu et approuvé, bon pour accord »</p>
  </div>
</div>
</section>
</body>
</html>
`;
}

// --- Fabrication --------------------------------------------------------------

async function pdf(html, sortie, numero, nom, brouillon = false, piedDePage = '') {
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
    footerTemplate: `<div style="width:100%;font:8px Segoe UI,Arial,sans-serif;color:#6a6257;padding:0 15mm;display:flex;justify-content:space-between"><span>${h(nom)} · ${piedDePage ? h(piedDePage) : `${brouillon ? 'projet de devis' : 'devis'} n° ${h(numero)}`}</span><span>page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`
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
  await pdf(`${base}.html`, sortie, d.numero, asso.association.nom, d.brouillon);
  d.genereLe = new Date().toISOString().slice(0, 16).replace('T', ' ');
  d.montants = { prestation: c.total, avecOptions: c.options.length ? c.totalOptions : undefined, forfaitDeplacement: c.totalDep, deplacementOffert: c.offert };
  if (c.formules.length > 1) d.montants.formules = Object.fromEntries(c.formules.map(f => [f.lettre, { prestation: f.total, avecOptions: f.options.length ? f.totalOptions : undefined }]));
  fs.writeFileSync(fichier, `${JSON.stringify(d, null, 2)}\n`);

  console.log(`✓ ${sortie}${d.brouillon ? '  (brouillon : filigrane, sans signature)' : ''}`);
  console.log(`  ${d.numero} · ${d.client.nom} · ${d.evenement.titre}`);
  console.log(c.depInclus ? `  Déplacement inclus (${d.deplacement.kmAller} km, moins de ${asso.deplacement.seuilKmInclus} km)` : `  Forfait de déplacement ${euros(c.totalDep)} (calcul : ${c.lignesDep.map(l => `${l.libelle} ${euros(l.montant)}`).join(' + ')}${d.deplacement.source ? ` ; source ${d.deplacement.source}` : ''})${c.offert ? `, offert ${euros(c.offert)}` : ', facturé'}`);
  for (const f of c.formules) {
    console.log(`  ${f.lettre ? `Formule ${f.lettre} · ${f.nom}, ` : ''}${periode(f.debut, f.fin)}${f.soiree ? ' + soirée' : ''}`);
    console.log(`    Vie de camp ${f.nbJours} × ${euros(c.prixJour)} = ${euros(f.camp)}${f.soireeMontant ? ` · soirée du dernier jour ${euros(f.soireeMontant)}` : ''}${f.remise ? ` · remise ${euros(f.remise)}` : ''} · montant ${euros(f.total)}${f.options.length ? ` · avec option${f.options.length > 1 ? 's' : ''} ${euros(f.totalOptions)}` : ''}`);
  }
}

function equipe(texte) {
  const presents = texte.split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
  if (!presents.length) stop('npm run devis -- equipe "<Nom>, <Nom>, …"');
  const asso = lireAssociation();
  const cv = couverture(presents, lireAteliers(), asso.defauts.minimumParAtelier, asso.socle, asso.membres);
  if (cv.inconnus.length) console.log(`? Inconnus du site et du glossaire (membres de association.json) : ${cv.inconnus.join(', ')}`);
  console.log(`Présents : ${cv.venus.map(m => `${m.nom} (${[...m.roles].join(', ')})`).join(' · ') || 'aucun reconnu'}`);
  const lignes = Object.values(cv.par);
  const option = x => asso.tarifs.options[x.atelier.id] ? ' [option]' : '';
  console.log(`\nSocle, toujours au devis : ${(asso.socle || []).map(id => cv.par[id]?.atelier.titre).filter(Boolean).join(', ')}`);
  console.log('\nPossible en plus :');
  for (const x of lignes.filter(x => x.possible && !x.socle)) console.log(`  ✓ ${x.atelier.id.padEnd(18)} ${x.atelier.titre}${option(x)} — ${x.collectif ? 'collectif' : x.qui.join(', ')}`);
  const non = lignes.filter(x => !x.possible);
  console.log('\nPas possible sans d’autres membres :');
  if (!non.length) console.log('  (rien)');
  const membres = [...lireMembres().values()];
  for (const x of non) console.log(`  ✗ ${x.atelier.id.padEnd(18)} ${x.atelier.titre}${option(x)} — ${x.qui.length ? `${x.faut} membres nécessaires, présent : ${x.qui.join(', ')} ; ` : ''}animé par ${membres.filter(m => m.ateliers.has(x.atelier.id)).map(m => m.nom).join(', ')}`);
  console.log(`\n${cv.venus.length} présent${cv.venus.length > 1 ? 's' : ''} reconnu${cv.venus.length > 1 ? 's' : ''} ; minimum garanti habituel : ${asso.defauts.troupe.minimum}.`);
}

// Note d'intention (ou tout document d'accompagnement demandé par un cahier
// des charges) : un texte Markdown simple écrit à côté de la fiche — titres
// #, ##, ###, paragraphes, listes « - », **gras** — mis en page avec
// l'en-tête et le gabarit du devis.
function markdown(texte) {
  const enLigne = s => h(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  const blocs = [];
  for (const bloc of texte.replace(/\r/g, '').split(/\n{2,}/)) {
    const lignes = bloc.split('\n').filter(l => l.trim());
    if (!lignes.length) continue;
    const titre = lignes[0].match(/^(#{1,3})\s+(.*)$/);
    if (titre && lignes.length === 1) blocs.push(`<h${titre[1].length}>${enLigne(titre[2])}</h${titre[1].length}>`);
    else if (lignes.every(l => /^\s*-\s+/.test(l))) blocs.push(`<ul class="puces">${lignes.map(l => `<li>${enLigne(l.replace(/^\s*-\s+/, ''))}</li>`).join('')}</ul>`);
    else blocs.push(`<p>${enLigne(lignes.join(' '))}</p>`);
  }
  return blocs.join('\n');
}

async function note(fichier) {
  fichier = path.resolve(fichier || '');
  if (!/\.md$/.test(fichier) || !fs.existsSync(fichier)) stop('npm run devis -- note "<chemin du .md>" (texte de la note, à côté de la fiche du devis)');
  horsDuDepot(fichier);
  const asso = lireAssociation();
  const a = asso.association;
  const corps = markdown(fs.readFileSync(fichier, 'utf8'));
  const base = fichier.replace(/\.md$/, '');
  const titre = path.basename(base);
  fs.writeFileSync(`${base}.html`, `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${h(titre)}</title>
<link rel="stylesheet" href="${img(GABARIT)}">
</head>
<body class="note-intention">
<header class="entete">
  <img class="logo" src="${img(path.join(RACINE, 'assets/img/ecusson-epee-chaudron.webp'))}" alt="">
  <div class="nom">
    <strong>${h(a.nom)}</strong>
    <span>${h(a.forme)} · mesnie de reconstitution médiévale</span>
    <span class="liens"><a href="mailto:${h(a.email)}">${h(a.email)}</a> · <a href="${h(a.site)}">${h(a.site.replace(/^https?:\/\//, ''))}</a></span>
  </div>
  <address>
    ${a.adresse.map(h).join('<br>')}<br>
    ${h(a.contact.nom)} · ${h(a.contact.telephone)}
  </address>
</header>
${corps}
</body>
</html>
`);
  await pdf(`${base}.html`, `${base}.pdf`, '', a.nom, false, titre);
  console.log(`✓ ${base}.pdf`);
}

function liste() {
  const tous = devisExistants();
  if (!tous.length) return console.log('Aucun devis fait avec cet outil pour l’instant.');
  for (const { devis: d } of tous) {
    const m = !d.montants ? 'non généré'
      : d.montants.formules ? Object.entries(d.montants.formules).map(([l, x]) => `${l} ${euros(x.avecOptions ?? x.prestation)}`).join(' / ')
      : euros(d.montants.avecOptions ?? d.montants.prestation);
    console.log(`${d.numero}  ${d.client?.nom || '?'} · ${d.evenement?.titre || '?'} (${d.evenement?.debut || d.formules?.[0]?.debut || '?'}) · ${m}`);
  }
}

const [commande, ...args] = process.argv.slice(2);
if (commande === 'nouveau') nouveau(args[0], args[1]);
else if (commande === 'liste') liste();
else if (commande === 'equipe') equipe(args.join(' '));
else if (commande === 'note') await note(args[0]);
else if (commande) await generer(commande);
else console.log('npm run devis -- nouveau "<Ville>" [<année>]  |  npm run devis -- "<fiche.json>"  |  npm run devis -- liste  |  npm run devis -- equipe "<Nom>, <Nom>"  |  npm run devis -- note "<note.md>"');
