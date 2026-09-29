(function(){
  // Bouton retour du téléphone : une fiche ou une photo ouverte occupe tout
  // l'écran, le visiteur la prend pour une page. Chaque ouverture ajoute donc
  // une entrée d'historique, et « retour » referme la fiche au lieu de
  // quitter le site. Fermer par la croix retire l'entrée ajoutée.
  // Les fiches s'empilent : l'atelier ouvert depuis un personnage se referme
  // sur la fiche du personnage.
  const overlayHistory = (() => {
    const closers = [];
    let ownBacks = 0;      // retours déclenchés par la croix, pas par le visiteur
    let fromHistory = false;
    window.addEventListener('popstate', () => {
      if(ownBacks){ ownBacks--; return; }
      const close = closers.pop();
      if(!close) return;
      fromHistory = true;
      try { close(); } finally { fromHistory = false; }
    });
    return {
      opened(close){
        if(closers.includes(close)) return; // fiche suivante : même entrée
        closers.push(close);
        history.pushState({ecOverlay: true}, '');
      },
      closed(close){
        if(fromHistory) return; // déjà retirée par le bouton retour
        const i = closers.lastIndexOf(close);
        if(i === -1) return;
        closers.splice(i, 1);
        ownBacks++;
        history.back();
      }
    };
  })();

  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');
  if(menuButton && nav){
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (event) => {
      if(event.target.matches('a')){
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if(nav){
    const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
    const navSections = navLinks
      .map(link => ({link, section: document.querySelector(link.getAttribute('href'))}))
      .filter(item => item.section);
    let navTicking = false;

    function updateActiveNav(){
      const readingLine = window.scrollY + window.innerHeight * .42;
      let activeItem = null;
      navSections.forEach(item => {
        if(item.section.offsetTop <= readingLine) activeItem = item;
      });
      navSections.forEach(item => {
        if(item === activeItem){
          item.link.setAttribute('aria-current', 'page');
        } else {
          item.link.removeAttribute('aria-current');
        }
      });
      navTicking = false;
    }

    function requestActiveNavUpdate(){
      if(navTicking) return;
      navTicking = true;
      window.requestAnimationFrame(updateActiveNav);
    }

    window.addEventListener('scroll', requestActiveNavUpdate, {passive: true});
    window.addEventListener('resize', requestActiveNavUpdate);
    updateActiveNav();
  }

  document.querySelectorAll('[data-tabs]').forEach((tabsRoot) => {
    const tabs = tabsRoot.querySelectorAll('[data-tab]');
    const panels = tabsRoot.querySelectorAll('[data-panel]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = tab.dataset.tab;
        tabs.forEach(t => { t.classList.toggle('is-active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
        panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.panel === id));
      });
    });
  });

  const photos = window.EC_PHOTOS || [];
  const filterHost = document.querySelector('[data-gallery-filters]');
  const gallery = document.querySelector('[data-gallery-grid]');
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImg = document.querySelector('[data-lightbox-image]');
  const lightboxCaption = document.querySelector('[data-lightbox-caption]');
  const lightboxClose = document.querySelector('[data-lightbox-close]');
  const lightboxPrev = document.querySelector('[data-lightbox-prev]');
  const lightboxNext = document.querySelector('[data-lightbox-next]');
  let active = 'Toutes';
  let currentPhotos = [];
  let lightboxPhoto = null;

  function categories(){
    return ['Toutes', ...Array.from(new Set(photos.map(p => p.category)))];
  }
  function renderFilters(){
    if(!filterHost) return;
    filterHost.innerHTML = '';
    categories().forEach(cat => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter' + (cat === active ? ' is-active' : '');
      button.textContent = cat;
      button.addEventListener('click', () => { active = cat; renderFilters(); renderGallery(); });
      filterHost.appendChild(button);
    });
  }
  function renderGallery(){
    if(!gallery) return;
    gallery.innerHTML = '';
    currentPhotos = photos.filter(p => active === 'Toutes' || p.category === active);
    currentPhotos.forEach(photo => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', 'Voir la photo : ' + photo.title);
      const img = document.createElement('img');
      img.src = photo.thumb;
      img.alt = photo.alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 720;
      img.height = 520;
      const caption = document.createElement('span');
      caption.textContent = photo.title;
      button.append(img, caption);
      button.addEventListener('click', () => openLightbox(photo, button));
      gallery.appendChild(button);
    });
  }
  let lightboxTrigger = null;
  function openLightbox(photo, trigger){
    if(!lightbox) return;
    lightboxTrigger = trigger || null;
    lightboxPhoto = photo;
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt;
    lightboxCaption.textContent = photo.title;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    overlayHistory.opened(closeLightbox);
    if(lightboxClose) lightboxClose.focus();
  }
  function showRelativePhoto(offset){
    if(!lightboxPhoto || !currentPhotos.length) return;
    const currentIndex = currentPhotos.indexOf(lightboxPhoto);
    if(currentIndex === -1) return;
    const nextIndex = (currentIndex + offset + currentPhotos.length) % currentPhotos.length;
    openLightbox(currentPhotos[nextIndex], lightboxTrigger);
  }
  function closeLightbox(){
    if(!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    overlayHistory.closed(closeLightbox);
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if(lightboxTrigger) lightboxTrigger.focus();
    lightboxTrigger = null;
    lightboxPhoto = null;
  }
  if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if(lightboxPrev) lightboxPrev.addEventListener('click', () => showRelativePhoto(-1));
  if(lightboxNext) lightboxNext.addEventListener('click', () => showRelativePhoto(1));
  if(lightbox) lightbox.addEventListener('click', event => { if(event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if(!lightbox || lightbox.hidden) return;
    if(event.key === 'Escape'){
      closeLightbox();
      return;
    }
    if(event.key === 'ArrowLeft'){
      showRelativePhoto(-1);
      return;
    }
    if(event.key === 'ArrowRight'){
      showRelativePhoto(1);
      return;
    }
    if(event.key !== 'Tab') return;
    const focusable = lightbox.querySelectorAll('button:not([disabled]),a[href]');
    if(!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if(event.shiftKey && document.activeElement === first){
      event.preventDefault();
      last.focus();
    } else if(!event.shiftKey && document.activeElement === last){
      event.preventDefault();
      first.focus();
    }
  });
  renderFilters(); renderGallery();

  const moduleModal = document.querySelector('[data-module-modal]');
  const moduleModalImage = document.querySelector('[data-module-modal-image]');
  const moduleModalTitle = document.querySelector('[data-module-modal-title]');
  const moduleModalDetails = document.querySelector('[data-module-modal-details]');
  const moduleModalClose = document.querySelector('[data-module-modal-close]');
  const moduleModalWishlist = document.querySelector('[data-module-modal-wishlist]');
  const moduleModalPrev = document.querySelector('[data-module-modal-prev]');
  const moduleModalNext = document.querySelector('[data-module-modal-next]');
  // Ateliers : cartes générées depuis assets/js/ateliers.js, comme les
  // personnages le sont depuis personnages.js. Elles doivent exister avant la
  // ligne suivante, qui les recense pour les filtres, la liste de souhaits et
  // la fiche plein écran — le balisage produit est celui qu'écrivait le HTML.
  const atelierGrid = document.querySelector('[data-atelier-grid]');
  if(atelierGrid){
    (window.EC_ATELIERS || []).forEach(atelier => {
      const card = document.createElement('article');
      card.className = 'card module-card reveal';
      card.dataset.category = atelier.categorie;
      card.dataset.atelier = atelier.id;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-haspopup', 'dialog');

      const img = document.createElement('img');
      img.src = atelier.img;
      img.alt = atelier.alt || atelier.titre;
      img.width = 720;
      img.height = 520;
      img.loading = 'lazy';
      img.decoding = 'async';

      const corps = document.createElement('div');
      const titre = document.createElement('h3');
      titre.textContent = atelier.titre;
      const resume = document.createElement('p');
      resume.textContent = atelier.resume;
      corps.append(titre, resume);

      const details = document.createElement('div');
      details.className = 'module-details';
      details.hidden = true;
      (atelier.texte || []).forEach(contenu => {
        const p = document.createElement('p');
        p.textContent = contenu;
        details.appendChild(p);
      });
      if(atelier.points && atelier.points.length){
        const rubrique = document.createElement('h4');
        rubrique.textContent = 'Points abordés';
        const liste = document.createElement('ul');
        atelier.points.forEach(point => {
          const li = document.createElement('li');
          li.textContent = point;
          liste.appendChild(li);
        });
        details.append(rubrique, liste);
      }

      card.append(img, corps, details);
      atelierGrid.appendChild(card);
    });
  }
  const moduleCards = Array.from(document.querySelectorAll('.module-card'));
  const moduleFilterHost = document.querySelector('.module-filters');
  if(moduleFilterHost){
    const moduleFilterButtons = Array.from(moduleFilterHost.querySelectorAll('[data-module-filter]'));
    moduleFilterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const value = button.dataset.moduleFilter;
        moduleFilterButtons.forEach(b => b.classList.toggle('is-active', b === button));
        moduleCards.forEach(card => {
          card.hidden = value !== 'toutes' && card.dataset.category !== value;
        });
      });
    });
  }
  const contactEmail = document.querySelector('[data-contact-email]');
  const wishlistNotification = document.querySelector('[data-wishlist-notification]');
  const wishlistStorageKey = 'epee-chaudron-animation-wishlist';
  let wishlist = [];
  let notificationTimer = null;
  let moduleTrigger = null;
  let moduleReturn = null;

  try {
    const savedWishlist = JSON.parse(localStorage.getItem(wishlistStorageKey) || '[]');
    if(Array.isArray(savedWishlist)) wishlist = savedWishlist.filter(item => typeof item === 'string');
  } catch(error) {
    wishlist = [];
  }

  function buildContactEmail(){
    const selectedAnimations = wishlist.length
      ? wishlist.map(animation => '- ' + animation).join('\n')
      : '- Aucune animation sélectionnée pour le moment';
    const subject = 'Demande de contact - animations médiévales';
    const body = [
      'Bonjour,',
      '',
      'Je souhaite obtenir des renseignements sur vos animations.',
      '',
      'Animations qui m’intéressent :',
      selectedAnimations,
      '',
      'Nom :',
      'Commune / organisme :',
      'Date envisagée :',
      'Type de public :',
      'Téléphone :',
      '',
      'Message :',
      '',
      'Cordialement'
    ].join('\n');
    const recipient = 'contact@epee-chaudron.fr';
    return {
      body,
      clipboardText: 'À : ' + recipient + '\nObjet : ' + subject + '\n\n' + body,
      url: 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
    };
  }

  function updateContactEmail(){
    if(!contactEmail) return;
    contactEmail.href = buildContactEmail().url;
  }

  function showNotification(message){
    if(!wishlistNotification) return;
    wishlistNotification.textContent = message;
    wishlistNotification.classList.add('is-visible');
    window.clearTimeout(notificationTimer);
    notificationTimer = window.setTimeout(() => {
      wishlistNotification.classList.remove('is-visible');
    }, 5200);
  }

  function copyContactEmail(text){
    if(navigator.clipboard && window.isSecureContext){
      return navigator.clipboard.writeText(text);
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied ? Promise.resolve() : Promise.reject(new Error('Clipboard unavailable'));
  }

  function showWishlistNotification(animation, action){
    let message;
    if(action === 'removed'){
      message = 'L’animation « ' + animation + ' » a été retirée de votre liste de souhaits.';
    } else if(action === 'already-selected'){
      message = 'L’animation « ' + animation + ' » figure déjà dans votre liste de souhaits.';
    } else {
      message = 'L’animation « ' + animation + ' » a été ajoutée à votre liste de souhaits pour prendre contact avec nous.';
    }
    showNotification(message);
  }

  function updateWishlistButtons(){
    moduleCards.forEach(card => {
      const title = card.querySelector('h3');
      const button = card.querySelector('[data-module-wishlist]');
      if(!title || !button) return;
      const selected = wishlist.includes(title.textContent.trim());
      button.setAttribute('aria-pressed', String(selected));
      button.textContent = selected ? '♥' : '♡';
      button.setAttribute('aria-label', selected
        ? 'Retirer de votre liste : ' + title.textContent.trim()
        : 'Ajouter à votre liste : ' + title.textContent.trim());
    });
    updateModalWishlistButton();
  }

  function updateModalWishlistButton(){
    if(!moduleModalWishlist || !moduleTrigger) return;
    const title = moduleTrigger.querySelector('h3');
    if(!title) return;
    const animation = title.textContent.trim();
    const selected = wishlist.includes(animation);
    moduleModalWishlist.setAttribute('aria-pressed', String(selected));
    moduleModalWishlist.textContent = selected ? '♥' : '♡';
    moduleModalWishlist.setAttribute('aria-label', selected
      ? 'Retirer de votre liste : ' + animation
      : 'Ajouter à votre liste : ' + animation);
  }

  function saveWishlist(){
    try {
      localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist));
    } catch(error) {
      // The list remains available for the current page if storage is unavailable.
    }
    updateContactEmail();
    updateWishlistButtons();
  }

  function toggleModuleWishlist(card){
    if(!card) return;
    const title = card.querySelector('h3');
    if(!title) return;
    const animation = title.textContent.trim();
    const animationIndex = wishlist.indexOf(animation);
    if(animationIndex === -1){
      wishlist.push(animation);
      saveWishlist();
      showWishlistNotification(animation, 'added');
    } else {
      wishlist.splice(animationIndex, 1);
      saveWishlist();
      showWishlistNotification(animation, 'removed');
    }
  }

  updateContactEmail();
  if(contactEmail){
    contactEmail.addEventListener('click', event => {
      event.preventDefault();
      const email = buildContactEmail();
      copyContactEmail(email.clipboardText)
        .then(() => {
          window.setTimeout(() => {
            showNotification('Si votre messagerie ne s’est pas ouverte, vous n’avez plus qu’à coller le presse-papiers dans un mail.');
          }, 700);
        })
        .catch(() => {
          window.setTimeout(() => {
            showNotification('Votre messagerie n’a peut-être pas pu s’ouvrir et la copie a échoué. Écrivez à contact@epee-chaudron.fr.');
          }, 700);
        });
      window.location.href = email.url;
    });
  }

  // Glissement du doigt sur une fiche ouverte : gauche pour la suivante,
  // droite pour la précédente. Réservé au tactile — à la souris, les flèches
  // et les touches du clavier font déjà le travail, et un cliquer-glisser
  // servirait plutôt à sélectionner du texte.
  //
  // Un pouce ne trace pas une ligne droite : il tourne autour de sa base et
  // décrit un arc qui part à peu près à l'horizontale, puis plonge. Juger le
  // geste sur son point d'arrivée revenait à refuser justement les glissements
  // les plus naturels. Le sens se décide donc sur les premiers pixels, et un
  // geste parti à l'horizontale nous appartient jusqu'au bout : le navigateur
  // n'en fait pas un défilement.
  function enableSwipe(element, onPrev, onNext){
    if(!element) return;
    let x0 = 0;
    let y0 = 0;
    let x = 0;
    let sens = null; // null tant que le doigt n'a pas bougé, puis 'horizontal', 'vertical' ou 'ignore'
    element.addEventListener('touchstart', event => {
      // À deux doigts, c'est un pincement pour zoomer : on ne s'en mêle pas.
      if(event.touches.length !== 1){ sens = 'ignore'; return; }
      x0 = x = event.touches[0].clientX;
      y0 = event.touches[0].clientY;
      sens = null;
    }, {passive: true});
    element.addEventListener('touchmove', event => {
      if(sens === 'ignore' || sens === 'vertical') return;
      if(event.touches.length !== 1){ sens = 'ignore'; return; }
      x = event.touches[0].clientX;
      const dx = Math.abs(x - x0);
      const dy = Math.abs(event.touches[0].clientY - y0);
      // On tranche dès que le doigt a vraiment bougé : sous 55° par rapport à
      // l'horizontale, c'est un changement de fiche ; au-delà, un défilement.
      if(sens === null && (dx > 10 || dy > 10)) sens = dx > dy * 0.7 ? 'horizontal' : 'vertical';
      if(sens === 'horizontal' && event.cancelable) event.preventDefault();
    }, {passive: false});
    element.addEventListener('touchend', () => {
      if(sens !== 'horizontal') return;
      sens = null;
      const dx = x - x0;
      if(Math.abs(dx) < 50) return; // un effleurement n'est pas un geste
      if(dx < 0) onNext(); else onPrev();
    });
    element.addEventListener('touchcancel', () => { sens = 'ignore'; });
  }

  // Une photo en largeur se pose au-dessus du texte, une photo en hauteur à
  // côté. On attend que l'image soit décodée pour connaître son sens : la
  // carte, chargée en différé, ne le sait pas toujours encore.
  const moduleModalPanel = moduleModal ? moduleModal.querySelector('.module-modal-panel') : null;
  function orienterModuleModal(){
    if(!moduleModalPanel || !moduleModalImage.naturalWidth) return;
    moduleModalPanel.classList.toggle('is-paysage', moduleModalImage.naturalWidth > moduleModalImage.naturalHeight);
  }
  if(moduleModalImage) moduleModalImage.addEventListener('load', orienterModuleModal);

  function openModuleModal(card){
    if(!moduleModal) return;
    const image = card.querySelector('img');
    const title = card.querySelector('h3');
    const details = card.querySelector('.module-details');
    if(!image || !title || !details) return;
    moduleTrigger = card;
    moduleModalImage.src = image.src;
    moduleModalImage.alt = image.alt;
    if(moduleModalImage.complete) orienterModuleModal();
    moduleModalTitle.textContent = title.textContent;
    moduleModalDetails.innerHTML = details.innerHTML;
    updateModalWishlistButton();
    moduleModal.hidden = false;
    document.body.classList.add('is-modal-open');
    document.body.style.overflow = 'hidden';
    overlayHistory.opened(closeModuleModal);
    moduleModalClose.focus();
  }

  function showRelativeModule(offset){
    if(!moduleTrigger || !moduleCards.length) return;
    const currentIndex = moduleCards.indexOf(moduleTrigger);
    const nextIndex = (currentIndex + offset + moduleCards.length) % moduleCards.length;
    openModuleModal(moduleCards[nextIndex]);
  }

  function closeModuleModal(){
    if(!moduleModal || moduleModal.hidden) return;
    moduleModal.hidden = true;
    overlayHistory.closed(closeModuleModal);
    moduleModalImage.src = '';
    moduleModalDetails.innerHTML = '';
    document.body.classList.remove('is-modal-open');
    document.body.style.overflow = '';
    // Ouvert depuis la fiche d'un personnage : on y revient.
    if(moduleReturn){
      const back = moduleReturn;
      moduleReturn = null;
      back();
    } else if(moduleTrigger) moduleTrigger.focus();
  }

  moduleCards.forEach(card => {
    const title = card.querySelector('h3');
    const wishlistButton = document.createElement('button');
    wishlistButton.type = 'button';
    wishlistButton.className = 'module-wishlist';
    wishlistButton.dataset.moduleWishlist = '';
    wishlistButton.setAttribute('aria-pressed', 'false');
    wishlistButton.setAttribute('aria-label', 'Ajouter à votre liste : ' + (title ? title.textContent.trim() : 'cette animation'));
    wishlistButton.textContent = '♡';
    wishlistButton.addEventListener('click', event => {
      event.stopPropagation();
      toggleModuleWishlist(card);
    });
    wishlistButton.addEventListener('keydown', event => {
      event.stopPropagation();
    });
    card.appendChild(wishlistButton);
    card.addEventListener('click', () => openModuleModal(card));
    card.addEventListener('keydown', event => {
      if(event.target !== card) return;
      if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        openModuleModal(card);
      }
    });
  });
  updateWishlistButtons();
  if(moduleModalClose) moduleModalClose.addEventListener('click', closeModuleModal);
  if(moduleModalPrev) moduleModalPrev.addEventListener('click', () => showRelativeModule(-1));
  if(moduleModalNext) moduleModalNext.addEventListener('click', () => showRelativeModule(1));
  if(moduleModal) enableSwipe(moduleModal.querySelector('.module-modal-panel'),
    () => showRelativeModule(-1), () => showRelativeModule(1));
  if(moduleModalWishlist) moduleModalWishlist.addEventListener('click', () => toggleModuleWishlist(moduleTrigger));
  if(moduleModal) moduleModal.addEventListener('click', event => {
    if(event.target === moduleModal) closeModuleModal();
  });
  document.addEventListener('keydown', event => {
    if(!moduleModal || moduleModal.hidden) return;
    if(event.key === 'Escape'){
      closeModuleModal();
      return;
    }
    if(event.key === 'ArrowLeft'){
      showRelativeModule(-1);
      return;
    }
    if(event.key === 'ArrowRight'){
      showRelativeModule(1);
      return;
    }
    if(event.key !== 'Tab') return;
    const focusable = moduleModal.querySelectorAll('button:not([disabled]),a[href]');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if(event.shiftKey && document.activeElement === first){
      event.preventDefault();
      last.focus();
    } else if(!event.shiftKey && document.activeElement === last){
      event.preventDefault();
      first.focus();
    }
  });

  const backToTop = document.querySelector('[data-back-to-top]');
  if(backToTop){
    const updateBackToTop = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', updateBackToTop, {passive: true});
    window.addEventListener('resize', updateBackToTop);
    backToTop.addEventListener('click', () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({top: 0, behavior: reduceMotion ? 'auto' : 'smooth'});
    });
    updateBackToTop();
  }

  // Personnages : cartes générées depuis assets/js/personnages.js, comme la
  // galerie l'est depuis photos.js — on ajoute un personnage sans toucher au HTML.
  const personaTrack = document.querySelector('[data-persona-track]');
  const personas = window.EC_PERSONNAGES || [];
  const personaCards = [];
  if(personaTrack){
    personas.forEach((persona, index) => {
      const card = document.createElement('article');
      card.className = 'persona';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-haspopup', 'dialog');
      card.setAttribute('aria-label', 'Voir la fiche de ' + persona.name + ', ' + persona.role);
      card.dataset.personaIndex = String(index);
      const figure = document.createElement('figure');
      figure.className = 'persona-figure';
      const img = document.createElement('img');
      img.src = persona.img;
      img.alt = persona.alt || persona.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 300;
      img.height = 400;
      figure.appendChild(img);
      const body = document.createElement('div');
      body.className = 'persona-body';
      const name = document.createElement('h3');
      name.textContent = persona.name;
      const role = document.createElement('p');
      role.className = 'persona-role';
      role.textContent = persona.role;
      const hook = document.createElement('p');
      hook.textContent = persona.hook;
      body.append(name, role, hook);
      card.append(figure, body);
      personaTrack.appendChild(card);
      personaCards.push(card);
    });
    // Le titre annonce le nombre de fiches : il suit tout seul les arrivées et
    // les départs dans personnages.js. Sans JavaScript, la page garde son titre
    // d'origine, sans chiffre.
    const titre = document.getElementById('perso-title');
    if(titre && personas.length){
      titre.textContent = personas.length === 1
        ? '1 personnage haut en couleur'
        : personas.length + ' personnages hauts en couleur';
    }
  }

  // Fiche personnage en plein écran, sur le modèle de la fiche animation.
  const personaModal = document.querySelector('[data-persona-modal]');
  if(personaModal && personas.length){
    const personaModalImage = personaModal.querySelector('[data-persona-modal-image]');
    const personaModalRole = personaModal.querySelector('[data-persona-modal-role]');
    const personaModalTitle = personaModal.querySelector('[data-persona-modal-title]');
    const personaModalDetails = personaModal.querySelector('[data-persona-modal-details]');
    const personaModalCounter = personaModal.querySelector('[data-persona-modal-counter]');
    const personaModalClose = personaModal.querySelector('[data-persona-modal-close]');
    const personaModalPrev = personaModal.querySelector('[data-persona-modal-prev]');
    const personaModalNext = personaModal.querySelector('[data-persona-modal-next]');
    let personaIndex = 0;

    function showPersona(index){
      const total = personas.length;
      personaIndex = ((index % total) + total) % total;
      const persona = personas[personaIndex];
      personaModalImage.src = persona.img;
      personaModalImage.alt = persona.alt || persona.name;
      personaModalRole.textContent = persona.role;
      personaModalTitle.textContent = persona.name;
      personaModalDetails.innerHTML = '';
      const hook = document.createElement('p');
      hook.className = 'persona-modal-hook';
      hook.textContent = persona.hook;
      personaModalDetails.appendChild(hook);
      if(persona.atelier){
        const atelier = document.createElement('p');
        atelier.className = 'persona-modal-atelier';
        const libelle = document.createElement('strong');
        libelle.textContent = 'Atelier :';
        // Un atelier qui porte le titre d'une animation ouvre sa fiche.
        const card = atelierCard(persona.atelier);
        if(card){
          const lien = document.createElement('button');
          lien.type = 'button';
          lien.className = 'persona-modal-atelier-link';
          lien.textContent = persona.atelier;
          lien.addEventListener('click', () => showAtelier(card));
          atelier.append(libelle, ' ', lien);
        } else {
          atelier.append(libelle, ' ' + persona.atelier);
        }
        personaModalDetails.appendChild(atelier);
      }
      // « texte » est facultatif dans personnages.js : une phrase, ou un
      // tableau de paragraphes, affichés sous l'atelier.
      if(persona.texte){
        const paragraphes = Array.isArray(persona.texte) ? persona.texte : [persona.texte];
        paragraphes.forEach(contenu => {
          const p = document.createElement('p');
          p.textContent = contenu;
          personaModalDetails.appendChild(p);
        });
      }
      personaModalCounter.textContent = (personaIndex + 1) + ' / ' + total;
    }

    function atelierCard(nom){
      const cle = nom.trim().toLowerCase();
      return moduleCards.find(card => {
        const titre = card.querySelector('h3');
        return titre && titre.textContent.trim().toLowerCase() === cle;
      });
    }

    function displayPersonaModal(index){
      showPersona(index);
      personaModal.hidden = false;
      document.body.classList.add('is-modal-open');
      document.body.style.overflow = 'hidden';
      personaModalClose.focus();
    }

    function openPersonaModal(index){
      displayPersonaModal(index);
      overlayHistory.opened(closePersonaModal);
    }

    // La fiche du personnage reste dans l'historique, masquée : fermer
    // l'atelier, par la croix ou par « retour », la fait réapparaître.
    function showAtelier(card){
      const from = personaIndex;
      personaModal.hidden = true;
      moduleReturn = () => displayPersonaModal(from);
      openModuleModal(card);
    }

    function closePersonaModal(){
      if(personaModal.hidden) return;
      personaModal.hidden = true;
      overlayHistory.closed(closePersonaModal);
      personaModalImage.removeAttribute('src');
      personaModalDetails.innerHTML = '';
      document.body.classList.remove('is-modal-open');
      document.body.style.overflow = '';
      // Rendre la main sur le personnage affiché en dernier : le carrousel
      // se replace dessus, on ne repart pas d'où on était parti.
      const back = personaCards[personaIndex];
      if(back) back.focus();
    }

    // Les cartes vivent dans un carrousel : n'ouvrir la fiche que si le doigt
    // n'a pas glissé, sinon chaque swipe ouvrirait une fiche.
    personaCards.forEach((card, index) => {
      let startX = 0;
      let startY = 0;
      let moved = false;
      card.addEventListener('pointerdown', event => {
        startX = event.clientX;
        startY = event.clientY;
        moved = false;
      });
      card.addEventListener('pointermove', event => {
        if(Math.abs(event.clientX - startX) > 10 || Math.abs(event.clientY - startY) > 10) moved = true;
      });
      card.addEventListener('pointercancel', () => { moved = true; });
      card.addEventListener('click', () => { if(!moved) openPersonaModal(index); });
      card.addEventListener('keydown', event => {
        if(event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          openPersonaModal(index);
        }
      });
    });

    personaModalClose.addEventListener('click', closePersonaModal);
    personaModalPrev.addEventListener('click', () => showPersona(personaIndex - 1));
    personaModalNext.addEventListener('click', () => showPersona(personaIndex + 1));
    enableSwipe(personaModal.querySelector('.module-modal-panel'),
      () => showPersona(personaIndex - 1), () => showPersona(personaIndex + 1));
    personaModal.addEventListener('click', event => {
      if(event.target === personaModal) closePersonaModal();
    });
    document.addEventListener('keydown', event => {
      if(personaModal.hidden) return;
      if(event.key === 'Escape'){
        closePersonaModal();
        return;
      }
      if(event.key === 'ArrowLeft'){
        showPersona(personaIndex - 1);
        return;
      }
      if(event.key === 'ArrowRight'){
        showPersona(personaIndex + 1);
        return;
      }
      if(event.key !== 'Tab') return;
      const focusable = personaModal.querySelectorAll('button:not([disabled]),a[href]');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if(event.shiftKey && document.activeElement === first){
        event.preventDefault();
        last.focus();
      } else if(!event.shiftKey && document.activeElement === last){
        event.preventDefault();
        first.focus();
      }
    });
  }

  // Carrousels horizontaux : le défilement et l'accroche sont natifs (CSS
  // scroll-snap) ; ici seulement les flèches, les points et le défilement
  // automatique, qui se met en pause dès que le visiteur touche, survole ou
  // met le focus dans le carrousel, et ne tourne que s'il est à l'écran.
  document.querySelectorAll('[data-carousel]').forEach(root => {
    const track = root.querySelector('[data-carousel-track]');
    if(!track) return;
    const prev = root.querySelector('[data-carousel-prev]');
    const next = root.querySelector('[data-carousel-next]');
    const dotsHost = root.querySelector('[data-carousel-dots]');
    const progress = root.querySelector('[data-carousel-progress]');
    const counter = root.querySelector('[data-carousel-counter]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = Number(root.dataset.autoplay) || 0;
    let items = [];
    // Positions d'arrêt : une par colonne. Sur une rangée, autant que
    // d'éléments ; sur deux rangées, deux éléments partagent la même position,
    // et avancer d'un élément ferait piétiner le carrousel une fois sur deux.
    let stops = [];
    let dots = [];
    let current = 0;
    let timer = null;
    let paused = false;
    let inView = false;
    let settleTimer = null;

    const offsetOf = item => item.offsetLeft - items[0].offsetLeft;
    const computeStops = () => {
      const vus = new Set();
      stops = [];
      items.forEach(item => {
        const x = Math.round(offsetOf(item));
        if(!vus.has(x)){ vus.add(x); stops.push(x); }
      });
      stops.sort((a, b) => a - b);
    };
    const nearestIndex = () => {
      const x = track.scrollLeft;
      let best = 0;
      let dist = Infinity;
      stops.forEach((pos, i) => {
        const d = Math.abs(pos - x);
        if(d < dist){ dist = d; best = i; }
      });
      return best;
    };
    const lastStart = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      let i = stops.length - 1;
      while(i > 0 && stops[i] > maxScroll + 1) i -= 1;
      return i;
    };
    const goTo = (index, smooth = true) => {
      if(!stops.length) return;
      const n = stops.length;
      const i = ((index % n) + n) % n;
      current = i; // pris en compte tout de suite : deux clics rapides avancent bien de deux
      track.scrollTo({left: stops[i], behavior: smooth && !reduceMotion ? 'smooth' : 'auto'});
    };
    const update = () => {
      current = nearestIndex();
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
        if(i === current) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current');
      });
      if(progress && stops.length) progress.style.setProperty('--progress', String((current + 1) / stops.length));
      if(counter && stops.length) counter.textContent = (current + 1) + ' / ' + stops.length;
    };
    const stop = () => { window.clearInterval(timer); timer = null; };
    const step = () => {
      if(paused || !inView || document.hidden || !stops.length) return;
      if(document.body.classList.contains('is-modal-open')) return;
      goTo(current >= lastStart() ? 0 : current + 1);
    };
    const start = () => {
      if(!delay || reduceMotion || timer) return;
      timer = window.setInterval(step, delay);
    };
    const restart = () => { stop(); start(); };
    const buildDots = () => {
      if(!dotsHost) return;
      dotsHost.innerHTML = '';
      dots = stops.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', 'Aller à la position ' + (i + 1) + ' sur ' + stops.length);
        dot.addEventListener('click', () => { goTo(i); restart(); });
        dotsHost.appendChild(dot);
        return dot;
      });
    };
    const refresh = () => {
      items = Array.from(track.children);
      computeStops();
      buildDots();
      update();
    };

    track.addEventListener('scroll', () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(update, 80);
    }, {passive: true});
    const pause = () => { paused = true; };
    const resume = () => { paused = false; restart(); };
    track.addEventListener('pointerdown', pause);
    track.addEventListener('pointerup', resume);
    track.addEventListener('pointercancel', resume);
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', resume);
    root.addEventListener('focusin', pause);
    root.addEventListener('focusout', resume);
    root.addEventListener('keydown', event => {
      if(event.key === 'ArrowLeft'){ event.preventDefault(); goTo(current - 1); restart(); }
      if(event.key === 'ArrowRight'){ event.preventDefault(); goTo(current + 1); restart(); }
    });
    if(prev) prev.addEventListener('click', () => { goTo(current - 1); restart(); });
    if(next) next.addEventListener('click', () => { goTo(current + 1); restart(); });
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refresh, 120);
    });

    if('IntersectionObserver' in window){
      new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
      }, {threshold: .35}).observe(root);
    } else {
      inView = true;
    }

    refresh();
    start();
  });

  const reveals = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, {threshold: .08});
    reveals.forEach(el => observer.observe(el));
  }

  // Service worker : le site s'ouvre sans réseau une fois visité, et devient
  // installable comme une application. La stratégie est décrite dans sw.js.
  // Un échec n'a aucune conséquence visible — page ouverte en fichier local,
  // navigation privée, hébergement sans HTTPS : le site fonctionne pareil,
  // simplement sans copie hors ligne.
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
