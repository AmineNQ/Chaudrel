/* ============================================================
   CHAUDREL — Scripts principaux
   - Header scroll
   - Menu mobile
   - Apparitions au scroll
   - FAQ accordion
   - Avant/Après carousel
   - Filtres des réalisations
   - Formulaire de contact (validation + feedback)
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Header scroll ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Animations fade-up au scroll (IntersectionObserver) ---------- */
  const fadeEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && fadeEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach((el) => io.observe(el));
  } else {
    fadeEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---------- Avant / Après carousel ---------- */
  const baContainer = document.querySelector('.before-after');
  if (baContainer) {
    const projects = JSON.parse(baContainer.dataset.projects || '[]');
    let idx = 0;
    const mainImg = baContainer.querySelector('.ba-img.main');
    const altImg = baContainer.querySelector('.ba-img.alt');
    const dotsWrap = baContainer.querySelector('.ba-dots');
    const prevBtn = baContainer.querySelector('.ba-prev');
    const nextBtn = baContainer.querySelector('.ba-next');
    const toggleBtn = baContainer.querySelector('.ba-toggle');
    let showAlt = false;

    function render(idxValue) {
      const p = projects[idxValue];
      if (!p) return;
      mainImg.src = p.before;
      mainImg.alt = 'Avant — ' + p.title;
      altImg.src = p.after;
      altImg.alt = 'Après — ' + p.title;
      baContainer.dataset.title = p.title;
      baContainer.classList.toggle('show-alt', showAlt);
      dotsWrap.querySelectorAll('.ba-dot').forEach((d, i) => d.classList.toggle('active', i === idxValue));
    }

    // Construire les dots
    projects.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'ba-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Projet ' + (i + 1));
      dot.addEventListener('click', () => { idx = i; showAlt = false; render(idx); });
      dotsWrap.appendChild(dot);
    });

    prevBtn?.addEventListener('click', () => { idx = (idx - 1 + projects.length) % projects.length; showAlt = false; render(idx); });
    nextBtn?.addEventListener('click', () => { idx = (idx + 1) % projects.length; showAlt = false; render(idx); });
    toggleBtn?.addEventListener('click', () => { showAlt = !showAlt; baContainer.classList.toggle('show-alt', showAlt); });

    // Auto-rotation douce
    let auto = setInterval(() => {
      showAlt = !showAlt;
      baContainer.classList.toggle('show-alt', showAlt);
      if (!showAlt) { idx = (idx + 1) % projects.length; }
    }, 4500);

    baContainer.addEventListener('mouseenter', () => clearInterval(auto));
    baContainer.addEventListener('mouseleave', () => {
      auto = setInterval(() => {
        showAlt = !showAlt;
        baContainer.classList.toggle('show-alt', showAlt);
        if (!showAlt) { idx = (idx + 1) % projects.length; }
      }, 4500);
    });

    render(0);
  }

  /* ---------- Filtres page réalisations ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('[data-cat]');
  if (filterBtns.length && projectItems.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
        projectItems.forEach((item) => {
          const itemCat = item.dataset.cat;
          const show = cat === 'all' || itemCat === cat;
          item.style.display = show ? '' : 'none';
          if (show) {
            item.classList.remove('in-view');
            requestAnimationFrame(() => item.classList.add('in-view'));
          }
        });
      });
    });
  }

  /* ---------- Formulaire de contact ---------- */
  const form = document.querySelector('.contact-form');
  if (form) {
    const successBox = form.querySelector('.form-success');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const required = ['firstName', 'lastName', 'email', 'service'];
      let ok = true;
      required.forEach((k) => {
        const v = (data.get(k) || '').toString().trim();
        if (!v) ok = false;
      });
      const email = (data.get('email') || '').toString().trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ok = false;

      if (!ok) {
        if (successBox) {
          successBox.textContent = 'Merci de compléter tous les champs requis avec un email valide.';
          successBox.style.background = 'rgba(220, 80, 80, 0.12)';
          successBox.style.borderColor = '#dc5050';
          successBox.style.color = '#ff8080';
          successBox.classList.add('show');
        }
        return;
      }

      // Stockage local en attendant un vrai backend
      const submissions = JSON.parse(localStorage.getItem('chaudrel_contacts') || '[]');
      submissions.push({
        at: new Date().toISOString(),
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
        email: data.get('email'),
        phone: data.get('phone') || '',
        service: data.get('service'),
        message: data.get('message') || '',
      });
      localStorage.setItem('chaudrel_contacts', JSON.stringify(submissions));

      if (successBox) {
        successBox.textContent = 'Merci ! Votre demande a bien été envoyée. Nous vous recontactons sous 24 h.';
        successBox.style.background = 'rgba(200, 169, 106, 0.12)';
        successBox.style.borderColor = 'var(--color-accent)';
        successBox.style.color = 'var(--color-accent)';
        successBox.classList.add('show');
      }
      form.reset();
      setTimeout(() => successBox?.classList.remove('show'), 6000);
    });
  }

  /* ---------- Année dynamique dans footer ---------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Marque la page active dans la nav ---------- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === path || (path === '' && link.dataset.nav === 'index.html')) {
      link.classList.add('active');
    }
  });
})();
