---
name: devis
description: Fabrique le devis PDF d'une prestation de L'Épée et le Chaudron pour un organisateur (mairie, comité des fêtes, site patrimonial). Pose un questionnaire court — ou part du mail de l'organisateur collé dans la conversation — pour que le devis soit juste du premier coup ; dit ce que l'équipe présente permet de faire ou non ; inclut le déplacement sous 100 km et le chiffre au-delà, même offert. Outil de poste, jamais mis en ligne ; devis, tarifs et données privées restent hors du dépôt. Déclenche sur : « fais un devis », « nouveau devis », « devis pour la mairie de … », « on est sollicités par … », un mail d'organisateur collé avec une demande de prestation, « refais le devis de … », « qu'est-ce qu'on peut faire avec … », « combien on avait demandé à … », « liste des devis ».
---

# Devis

Le but : un devis précis, que l'utilisateur n'a pas à reprendre à la main.

Le dépôt est public : il ne contient que la mécanique (`scripts/devis.mjs`,
`scripts/devis.css`, ce dossier). Tout le reste vit dans le dossier Contrats
de l'association, sur le poste (`EC_CONTRATS` pour en changer) :

| Fichier | Rôle |
|---|---|
| `Contrats/_devis/association.json` | Adresse, téléphone, SIRET, signataire, **tarifs**, **barème de déplacement** (seuil, camion), défauts, membres nécessaires par atelier, **clauses** de la section Conditions (règlement, assurance, sécurité, feu, météo, annulation, contact du jour). |
| `Contrats/_devis/signature.jpg` | Signature apposée sur le devis. Le logo est l'écusson du site, `assets/img/ecusson-epee-chaudron.webp` (version compacte de `sources/ecusson-epee-chaudron.png`). |
| `Contrats/<Ville>/<année>/Devis <Ville> <année>.json` | La fiche du devis : la source, archivée. |
| `… .pdf` / `… .html` | Ce qui part au client / la page qui a servi à l'imprimer. |

Textes et photos des animations : `assets/js/ateliers.js` et `assets/img/`.
Qui anime quoi : le champ `atelier` des personnages, `assets/js/personnages.js`.
Les devis ne vont jamais dans le dépôt : le script refuse d'écrire dedans.

## Déroulé

1. **Questionnaire.** Suivre [`questionnaire.md`](questionnaire.md). Deux
   entrées possibles :
   - un **mail** collé : en tirer tout ce qu'il dit, montrer ce qui a été
     compris, puis ne poser que les questions restantes ;
   - des **éléments donnés en vrac** (dates, options, présents) : pareil,
     on complète ce qui manque.
   Prix, remise et déplacement offert se demandent toujours, même quand le
   mail semble y répondre.
2. **Équipe.** Si les présents sont connus :
   `npm run devis -- equipe "<Nom>, <Nom>, …"`. Dire ce qui ne sera pas
   possible sans d'autres membres, avant d'écrire la fiche.
3. **Déplacement.** Distance aller depuis le siège (`deplacement.depart`),
   par recherche web avec la source. Jusqu'à `seuilKmInclus` km : inclus,
   le devis l'écrit. Au-delà : estimation pour le camion
   (`deplacement.camion` : location, carburant, péages aller-retour dans sa
   classe), affichée même quand elle est offerte, pour montrer ce que coûte
   la venue de la troupe. Les voitures des membres ne se facturent pas.
4. **Récapitulatif**, validé par l'utilisateur avant toute génération.
5. **Fiche.** `npm run devis -- nouveau "<Ville>" [<année>]`, puis la remplir.
   `ateliers`, `options` : des `id` de `ateliers.js` ; `presents` : des noms
   de `personnages.js`.
6. **Générer.** `npm run devis -- "<chemin de la fiche>"`. Le script refuse
   une fiche incomplète ou incohérente (déplacement non estimé, option sans
   prix, validité dépassée, animation que personne parmi les présents
   n'anime) et calcule seul tous les montants : ne jamais en écrire un à la
   main dans la fiche.
7. **Relire** le PDF avec `Read`. Deux pages ; sinon, alléger la liste des
   animations plutôt que la typographie. Rendre le chemin du PDF et le
   récapitulatif du script.
8. **Une fois signé** : le PDF signé se range à côté, sous un autre nom. Une
   fiche signée ne se régénère plus : nouveau chiffrage, nouvelle fiche.

## Règles

- **Tarifs** : uniquement ceux de `association.json`, jamais recopiés ici ni
  ailleurs dans le dépôt. Une hausse s'écrit là, avec la date dans
  `_historique`. Une option sans prix (`prixJour: null`) se fixe avec
  l'utilisateur avant d'être proposée.
- **Prix par fiche** : `prestation.prixJour` ne se renseigne que sur demande
  explicite ; préférer une `remise` nommée, visible sur le devis.
- **Clauses** : leur texte se modifie dans `conditions` de `association.json` ;
  une clause propre à un devis va dans `conditions` de la fiche. Le contact
  du jour même est `contactJourJ` de la fiche (par défaut, le contact de
  l'association).
- **Membres nécessaires** : `defauts.minimumParAtelier` (un duel se livre à
  deux). Un atelier qui se révèle demander plus de monde s'y ajoute.
- **Rien de privé dans le dépôt** : ni adresse, ni téléphone, ni SIRET, ni
  signature, ni montant, ni tarif, ni nom de client, y compris dans un commit
  ou un exemple. Les essais se font dans le scratchpad.
- `npm run devis -- liste` répond à « combien on avait demandé à … » pour les
  devis faits avec l'outil ; les plus anciens (Word, 2014–2026) sont dans les
  sous-dossiers de Contrats : `pdftotext -layout` pour les lire.
