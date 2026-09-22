# Déploiement du site L'Épée et le Chaudron

Le site est statique : aucun serveur applicatif, aucune base de données, aucune
compilation. Mettre en ligne = copier les fichiers sur l'hébergement.

## 1. Hébergement

> Ne jamais écrire de mot de passe ici : ce fichier est dans le dépôt git
> (privé aujourd'hui — retirer les identifiants s'il devient public).

| Élément | Valeur |
| --- | --- |
| Hébergeur | OVH — hébergement web mutualisé, offre **Free hosting** (100 Mo d'espace disque, le site en occupe ~7 Mo), datacentre `eu-west-gra`, cluster `[cluster retiré]` |
| Compte client OVH | identifiant `[identifiant OVH retiré]` (titulaire : [titulaire]) — https://www.ovh.com/manager/ |
| Nom de domaine | `epee-chaudron.fr`, enregistré chez OVH le 4 nov. 2013, expire le 4 nov. 2027 |
| Renouvellement | hébergement : automatique (prévu nov. 2027). Domaine : la fiche du domaine affiche **« Fréquence de renouvellement : aucune »** — à activer, ou renouveler à la main avant le 4 nov. 2027 |
| Serveurs DNS | `ns106.ovh.net` / `dns106.ovh.net` — zone gérée chez OVH |
| Adresse du serveur web | IPv4 `[IP retirée]`, IPv6 `[IP retirée]` |
| Accès aux fichiers | hôte `[hôte SFTP retiré]` — SFTP port 22 (activé) ou FTP port 21 — login `LOGIN_SFTP`, répertoire home `/home/LOGIN_SFTP` |
| Dossier racine du site | `www/` (site « Website-www », domaines associés : `epee-chaudron.fr`, `www.epee-chaudron.fr`, `[adresse technique retirée]`) |
| Où sont conservés les mots de passe | _(à compléter : gestionnaire de mots de passe de …)_ |
| Certificat HTTPS | Let's Encrypt actif sur `epee-chaudron.fr` et `www.epee-chaudron.fr` (émis le 15/11/2025, renouvelé automatiquement par OVH) |
| Adresse mail de contact | `contact@epee-chaudron.fr` — adresses e-mail OVH incluses dans l'offre (actives) |
| Dépôt de code | https://github.com/vynarim/EpeeChaudron (privé) — branche `main` |
| Personne référente | [titulaire], titulaire du domaine et de l'hébergement |

## 2. Contenu du dossier à envoyer

```text
index.html                 page unique du site
assets/css/style.css       styles (charte, responsive, carrousels)
assets/js/main.js          menu, fiches animations, liste de souhaits, carrousels, lightbox, onglets
assets/js/photos.js        liste des photos de la galerie
assets/js/personnages.js   liste des personnages (portrait, nom, rôle, accroche)
assets/img/full/           photos grand format (hero, bande, lightbox)
assets/img/thumbs/         miniatures 720×520 (cartes animations, galerie)
assets/img/personnages/    portraits des personnages (format 3/4)
assets/img/favicon.png, logo-square.webp
```

**Ne pas envoyer** : `node_modules/`, `.playwright-mcp/`, `.git/`, `.vscode/`,
`.claude/`, `.codex/`, `.impeccable/`, `scripts/`, `package*.json` et les fichiers
`*.md`. Ils ne servent qu'au développement.

## 3. Mettre en ligne

1. En local, ouvrir `index.html` (ou `npm run dev`) et vérifier que tout
   s'affiche : la page, une photo en plein écran, une fiche animation.
2. Lancer `npm run check` : il doit répondre « Vérification OK ».
3. Se connecter en SFTP à `[hôte SFTP retiré]` (port 22, login `LOGIN_SFTP`,
   par exemple avec FileZilla ou WinSCP) et envoyer `index.html` et le dossier
   `assets/` dans `www/`, en **écrasant** les fichiers existants.
   Les images retirées du dépôt peuvent rester sur le serveur sans gêner.
4. Ouvrir https://epee-chaudron.fr/ dans une fenêtre de navigation privée
   (pour ne pas voir l'ancienne version en cache) et refaire les trois
   vérifications de l'étape 1, sur téléphone puis sur ordinateur.

## 4. Mettre à jour le contenu

### Ajouter une photo à la galerie

1. Préparer deux fichiers WebP : la photo grand format dans `assets/img/full/`
   (1 600 px de large maximum) et sa miniature 720×520 dans
   `assets/img/thumbs/`, avec le même nom (`galerie-sujet.webp`).
2. Ajouter une ligne dans `assets/js/photos.js` :

```js
{
  src: 'assets/img/full/galerie-camp-exemple.webp',
  thumb: 'assets/img/thumbs/galerie-camp-exemple.webp',
  title: 'Titre court affiché sur la photo',
  category: 'Camp',
  alt: 'Description précise de la photo'
}
```

L'ordre du tableau est l'ordre du carrousel. La catégorie n'est plus affichée.

### Ajouter ou modifier un personnage

1. Déposer le portrait (photo verticale, format 3/4, environ 900×1200, WebP)
   dans `assets/img/personnages/`.
2. Ajouter ou modifier la ligne correspondante dans `assets/js/personnages.js` :

```js
{
  img: 'assets/img/personnages/personnages-exemple.webp',
  name: 'Nom affiché',
  role: 'Rôle affiché sous le nom',
  hook: 'Une phrase d’accroche, en italique sur la carte.',
  alt: 'Description de la photo'
}
```

Pour remplacer seulement la photo d'un personnage existant : écraser le fichier
du même nom, rien d'autre à changer. Les portraits actuels sont des reprises de
l'ancien site en basse définition, à remplacer dès que possible.

### Modifier une animation

Les animations sont dans `index.html`, section `#animations` : une carte
`article.module-card` par animation avec sa miniature, son titre, son résumé et,
dans `div.module-details`, le texte complet de la fiche.

### Modifier les textes

Tout le reste (hero, points forts, formats d'intervention, contact) est dans
`index.html`, en clair. L'adresse de contact apparaît deux fois : dans
`index.html` (bouton « Écrire à l'association ») et dans `assets/js/main.js`
(`recipient`, et le message d'erreur qui suit).

## 5. En cas de problème

- **La page est blanche ou sans style** : le dossier `assets/` n'est pas au
  même niveau que `index.html` sur le serveur.
- **Une image manque** : vérifier le nom exact du fichier (minuscules, accents
  interdits) et son chemin dans `photos.js` / `personnages.js`.
- **L'ancienne version s'affiche encore** : vider le cache ou ouvrir le site en
  navigation privée ; l'hébergeur peut aussi avoir un cache à purger.
- **Le bouton mail n'ouvre rien** : le texte du mail est copié dans le
  presse-papiers, l'utilisateur peut le coller dans sa messagerie ; le site
  l'indique.
