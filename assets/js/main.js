(function(){
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
    const recipient = 'contact@epeechaudron.fr';
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
            showNotification('Votre messagerie n’a peut-être pas pu s’ouvrir et la copie a échoué. Écrivez à contact@epeechaudron.fr.');
          }, 700);
        });
      window.location.href = email.url;
    });
  }

  function openModuleModal(card){
    if(!moduleModal) return;
    const image = card.querySelector('img');
    const title = card.querySelector('h3');
    const details = card.querySelector('.module-details');
    if(!image || !title || !details) return;
    moduleTrigger = card;
    moduleModalImage.src = image.src;
    moduleModalImage.alt = image.alt;
    moduleModalTitle.textContent = title.textContent;
    moduleModalDetails.innerHTML = details.innerHTML;
    updateModalWishlistButton();
    moduleModal.hidden = false;
    document.body.style.overflow = 'hidden';
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
    moduleModalImage.src = '';
    moduleModalDetails.innerHTML = '';
    document.body.style.overflow = '';
    if(moduleTrigger) moduleTrigger.focus();
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

  const reveals = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, {threshold: .08});
    reveals.forEach(el => observer.observe(el));
  }
})();
