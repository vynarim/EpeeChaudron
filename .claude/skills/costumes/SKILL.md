---
name: costumes
description: Analyse historique des costumes des personnages du site L'Épée et le Chaudron (siècle, région, pièces qui dénotent), archivée dans costumes/analyse.json, reportée sur le site et publiée sur une page à partager avec la troupe. À utiliser quand un personnage arrive ou change de nom, quand un portrait est remplacé, quand npm run check signale un « costume à analyser », ou quand on demande de revoir un costume. Déclenche sur : « analyse les costumes », « analyse le costume de … », « nouveau personnage », « nouvelle photo de … », « quel siècle pour … », « mets à jour la page des costumes ».
---

# Analyse des costumes

Sous l'accroche de chaque personnage, le site affiche le siècle et la région
que représente son costume, ou rien quand le costume n'est pas historique.
Ces deux lignes viennent d'une analyse faite portrait par portrait, archivée
dans `costumes/analyse.json` (jamais mise en ligne), puis partagée avec la
troupe sur une page claude.ai dont l'adresse est dans le champ `page` de
l'archive.

## Les pièces

| Fichier | Rôle |
|---|---|
| `costumes/analyse.json` | L'archive : une fiche par personnage. Source de vérité. |
| `scripts/costumes.mjs` | `npm run costumes` : état, reprise d'une fiche, zoom, report sur le site, page. |
| `assets/js/personnages.js` | Ce que le site affiche : `siecle`, `epoqueAffichee`, `epoque`, `lieu`, recopiés depuis l'archive. Ne pas les modifier à la main. |
| [`reperes.md`](reperes.md) | La grille de datation : quelle pièce désigne quelle époque, ce qui trahit le moderne ou la fantasy. |

## Déroulé

1. **État.** `npm run costumes` liste les personnages à analyser (jamais
   analysés, portrait remplacé depuis l'analyse, fiche ouverte), les écarts
   entre l'archive et le site, et les analyses sans personnage. Une analyse
   sans personnage dont le portrait est celui d'un personnage existant est un
   renommage : changer `nom` dans l'archive, sans refaire l'analyse.
2. **Ouvrir la fiche.** `npm run costumes -- reprendre <nom>`. L'analyse
   précédente passe dans `historique`, rien n'est effacé ; la fiche vierge
   reçoit l'empreinte du portrait actuel et la date du jour.
3. **Regarder.** Lire le portrait avec `Read` (WebP 900 × 1200). Pour chaque
   détail qui décide (coiffe, fermetures, tissu, ce qui pend à la ceinture),
   zoomer : `npm run costumes -- zoom <nom> <x> <y> <largeur> [<hauteur>]`,
   en pixels du portrait, puis lire `.apercus/zoom-<nom>.png`. Dater avec
   [`reperes.md`](reperes.md) : la pièce la plus datante fixe le siècle, les
   autres resserrent la période (« Fin XIIIe siècle », « Seconde moitié du
   XIVe siècle », « Fin XIVe – début XVe siècle »).
4. **Proposer avant d'écrire.** L'utilisateur compare puis valide. Lui
   présenter un tableau (personnage, siècle, époque, région, verdict), puis
   les pièces qui dénotent, et attendre sa réponse. Les champs `arbitrage`
   gardent ses décisions passées : ne pas reproposer ce qu'il a tranché sans
   élément nouveau (nouvelle photo, source).
5. **Écrire la fiche** dans `costumes/analyse.json`. `npm run costumes` ne
   doit plus signaler de fiche incomplète.
6. **Reporter sur le site.** `npm run costumes -- appliquer`, `npm run check`,
   commit, puis mise en ligne : `bash scripts/deploy.sh` et commit de
   `deploy/etat-en-ligne.txt`.
7. **Republier la page.** `npm run costumes -- page` fabrique `costumes/page/`
   et affiche la liste `files` à publier. Avec l'outil Artifact : `read` sur
   l'adresse du champ `page`, puis `publish` avec `url` = cette adresse,
   `file_path` = chemin absolu de `costumes/page/index.html`,
   `root` = `costumes/page` et la liste `files` affichée. Sans `url`, une
   nouvelle page naîtrait et le lien déjà donné à la troupe ne bougerait pas.

## La fiche

| Champ | Contenu |
|---|---|
| `nom` | Exactement le `name` de `personnages.js`. |
| `date`, `empreinte` | Posés par `reprendre`. L'empreinte dit quel portrait a été analysé. |
| `verdict` | `affiche`, `a-revoir` ou `rien` (voir plus bas). |
| `siecle` | 11 à 15. Absent quand le verdict est `rien`. |
| `epoque` | Facultatif : la période resserrée. Sans lui, la page et le site affichent « XVe siècle ». |
| `lieu` | La région quand le costume la désigne, sinon « Europe ». |
| `alt` | Description du portrait pour la page, centrée sur le costume. |
| `tient` | Ce qui est juste. Obligatoire sauf pour `rien`. |
| `details` | Les écarts mineurs d'un costume affiché tel quel. |
| `denote` | La pièce à revoir. Obligatoire pour `a-revoir`. |
| `pourquoi` | Pourquoi rien n'est affiché. Obligatoire pour `rien`. |
| `piste` | Facultatif : ce qui suffirait à corriger. |
| `arbitrage` | Facultatif, interne, absent de la page : une décision de la troupe et sa raison. |
| `historique` | Les analyses précédentes. Ne pas y toucher. |

Verdicts :

- **affiche** : le costume correspond à l'époque ; `details` pour le reste.
- **a-revoir** : la base est juste, mais une pièce visible appartient à une
  autre époque ou à l'imaginaire médiéval-fantastique. L'époque s'affiche.
- **rien** : aucune époque entre le XIe et le XVe siècle ne tient. Rien ne
  s'affiche sous la photo.

## Écrire pour la troupe

La page est lue par les membres eux-mêmes : on juge le costume tel qu'il
apparaît sur la photo, jamais la personne.

- Phrases courtes et factuelles, une pièce par phrase. Le terme exact (cale,
  guimpe, surcot, chaperon) plutôt que « chapeau » ou « robe ».
- Dire ce qui tient avant ce qui dénote, et donner une piste concrète
  quand il y en a une.
- Lunettes de vue, bracelet de festival, téléphone : les signaler comme
  visibles sur la photo, sans insister.
- Le décor (parking, mobilier moderne, panneau de prix) ne compte pas dans
  le verdict. Il va dans `decor`, en tête de l'archive.
- Mise en forme : une espace simple avant « : ; ? ! » et dans « 1 € », la
  page pose les insécables. `*mot*` met un terme étranger en italique.

## Limites

- Une seule photo : jambes et chaussures sont souvent hors cadre. Ne rien
  conclure de ce qu'on ne voit pas.
- Dater sans fausse précision : « vers 1400 » plutôt qu'une année.
- En cas de vrai doute entre deux verdicts, le dire dans la proposition et
  laisser l'utilisateur trancher.
