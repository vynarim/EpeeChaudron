---
name: devis
description: Fabrique le devis PDF d'une prestation de L'Épée et le Chaudron pour un organisateur (mairie, comité des fêtes, site patrimonial). Pose un questionnaire court — ou part du mail de l'organisateur collé dans la conversation — pour que le devis soit juste du premier coup ; dit ce que l'équipe présente permet de faire ou non ; inclut le déplacement sous 100 km et le facture au forfait au-delà, affiché même offert. Outil de poste, jamais mis en ligne ; devis, tarifs et données privées restent hors du dépôt. Déclenche sur : « fais un devis », « nouveau devis », « devis pour la mairie de … », « on est sollicités par … », un mail d'organisateur collé avec une demande de prestation, « refais le devis de … », « qu'est-ce qu'on peut faire avec … », « combien on avait demandé à … », « liste des devis ».
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
   - un **mail** collé, le cas le plus fréquent, parfois avec un cahier des
     charges en PDF : lire les deux en entier, montrer ce qui a été compris,
     puis ne poser que les questions restantes. Relever aussi ce que le
     cahier des charges demande en plus du prix : plusieurs formules, note
     d'intention, ventilation ;
   - des **éléments donnés en vrac** (dates, options, présents) : pareil,
     on complète ce qui manque.
   Prix, remise et déplacement offert se demandent toujours, même quand le
   mail semble y répondre.
2. **Équipe.** Si les présents sont connus :
   `npm run devis -- equipe "<Nom>, <Nom>, …"`. Dire ce qui ne sera pas
   possible sans d'autres membres, avant d'écrire la fiche.
3. **Déplacement.** Distance aller depuis le siège (`deplacement.depart`),
   par recherche web avec la source. Jusqu'à `seuilKmInclus` km : inclus,
   le devis l'écrit. Au-delà : un **forfait ferme**, jamais refacturé au
   réel, calculé pour le camion (`deplacement.camion` : location, carburant,
   péages aller-retour dans sa classe) et arrondi à la dizaine supérieure.
   Un calcul trop bas est perdu pour l'association : soigner la distance et
   les péages. Le forfait s'affiche même offert, pour montrer ce que coûte la
   venue de la troupe. Les voitures des membres ne se facturent pas.
4. **Récapitulatif**, validé par l'utilisateur avant toute génération.
5. **Fiche.** `npm run devis -- nouveau "<Ville>" [<année>]`, puis la remplir.
   Le **socle** (`socle` de `association.json` : vie de camp, défilé,
   cuisine, fruits et légumes, armes et armures, initiation à l'escrime,
   enfants en lice) est toujours au devis, sans rien écrire ; seul
   `evenement.defile: false` retire le défilé. `ateliers` ne contient que ce
   qui s'ajoute au socle, à la demande de l'utilisateur ou de l'organisateur ;
   `options`, les animations à supplément. Des `id` de `ateliers.js` ;
   `presents` : des noms de `personnages.js`, ou les vrais prénoms du
   glossaire `membres` de `association.json` (privé). Un prénom inconnu se
   demande, puis s'ajoute au glossaire.
   - **Plusieurs formules** quand l'organisateur hésite sur l'ampleur
     (journée / journée et soirée / week-end) : une seule fiche, `formules`
     = `[{ lettre, nom, debut, fin, ateliers, soiree, resume }]`. `ateliers`
     au niveau de la fiche est commun à toutes ; chaque formule ajoute les
     siens. Le PDF les chiffre côte à côte, l'organisateur coche la sienne.
   - **Demande ouverte, première version** : `brouillon: true` (filigrane
     « Projet · non contractuel », pas de signature, mention « sous réserve
     des membres ») et les trois options affichées ; une option sans
     animateur parmi les présents avertit au lieu de bloquer.
   - **Formats** (`defauts.formats` de `association.json`) : une journée,
     c'est un camp léger (2 tentes), monté le matin même si le déplacement
     est inclus, la veille sinon ; plusieurs jours, camp complet monté la
     veille. La journée type va de 10h à 18h ; au-delà, c'est exceptionnel
     (participer à un défilé que la fête organise). Un défilé, aux
     flambeaux ou non, n'est jamais une animation de la troupe : elle n'en
     fournit ni le matériel ni l'organisation, elle y participe quand
     l'organisateur en monte un. Ne pas le proposer comme une prestation.
     Une soirée s'écrit `soiree: { debut, fin,
     programme }` : un soir où l'on dort déjà sur place (samedi d'un
     week-end), elle ne coûte rien de plus ; **le dernier jour**, le camp ne
     se démonte pas : nuit sur place, hébergement et camion un jour de plus,
     démontage le lendemain. Le script la compte alors comme une journée
     (`tarifs.soireeDernierJourEnJours`) et l'écrit. Ne jamais proposer une
     soirée sans le dire à l'utilisateur ; une formule « journée + soirée »
     demandée par une mairie coûte presque un week-end. Une soirée seule
     (ni tente ni cuisine, animations en costume) n'a pas de tarif : le
     fixer avec l'utilisateur.
   - **Sol** : `accueil.sol` = `herbe`, `terre`, `goudron`, `paves` ou
     `a-definir`. Hors herbe et terre, la clause des clous d'arpentage
     (`conditionSolDur`) s'ajoute aux Conditions.
   - **Hébergement** : `accueil.hebergement: { surPlace, aLoger }`. Les
     repas restent inclus et n'ont jamais de ligne à eux.
   - **Remise** : `{ libelle, pourcent }` (calculée par le script, une par
     formule) ou `{ libelle, montant }`.
6. **Générer.** `npm run devis -- "<chemin de la fiche>"`. Le script refuse
   une fiche incomplète ou incohérente (distance non renseignée, option sans
   prix, validité dépassée, animation que personne parmi les présents
   n'anime) et calcule seul tous les montants : ne jamais en écrire un à la
   main dans la fiche.
7. **Relire** le PDF avec `Read`. Deux pages pour une prestation simple ;
   trois pour un devis détaillé (plusieurs formules : le chiffrage, les
   conditions et les signatures ouvrent la page 3). Au-delà, alléger la
   liste des animations plutôt que la typographie. Rendre le chemin du PDF
   et le récapitulatif du script.
   **Note d'intention**, quand le cahier des charges en demande une : la
   rédiger avec l'utilisateur dans `Note d'intention <Ville> <année>.md`, à
   côté de la fiche (place dans la fête, concept, formules, implantation,
   intervenants, besoins techniques, montage, sécurité, assurance et
   références), puis `npm run devis -- note "<chemin du .md>"`.
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
