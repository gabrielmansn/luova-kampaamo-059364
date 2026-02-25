/* =============================================
   LUOVA KAMPAAMO — main.js
   ============================================= */

'use strict';

/* ---- NAVIGAATIO: SCROLLED-TILA ---- */
const siteHeader = document.querySelector('.site-header');

function handleHeaderScroll() {
  if (window.scrollY > 40) {
    siteHeader.classList.add('scrolled');
  } else {
    siteHeader.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

/* ---- HAMPURILAISVALIKKO ---- */
const hamburger = document.querySelector('.hamburger');
const navMenu   = document.querySelector('.nav-menu');

function openMenu() {
  hamburger.classList.add('open');
  navMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  navMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});

// Sulje valikko linkkiä klikatessa
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Sulje valikko Escape-näppäimellä
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    closeMenu();
    hamburger.focus();
  }
});

// Sulje valikko klikattaessa valikon ulkopuolelle
document.addEventListener('click', e => {
  if (
    navMenu.classList.contains('open') &&
    !navMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeMenu();
  }
});

/* ---- SMOOTH SCROLL ANKKURILINKEILLE ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const headerHeight = siteHeader ? siteHeader.offsetHeight : 68;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});

/* ---- SCROLL-ANIMAATIOT (Intersection Observer) ---- */
const animatableSelectors = [
  '.service-card',
  '.pricing-block',
  '.about-grid',
  '.products-grid',
  '.trust-item',
  '.contact-form-wrap',
  '.contact-info',
  '.section-header',
];

const allAnimatable = document.querySelectorAll(animatableSelectors.join(', '));

allAnimatable.forEach(el => {
  el.classList.add('fade-up');
});

const intersectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        intersectionObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  }
);

allAnimatable.forEach(el => intersectionObserver.observe(el));

/* ---- LOMAKE: LÄHETYS JA PALAUTE ---- */
const contactForm  = document.getElementById('contact-form');
const formNotice   = document.getElementById('form-notice');

function showNotice(type, message) {
  formNotice.textContent = message;
  formNotice.className = 'form-notice ' + type;
  formNotice.style.display = 'block';

  // Scroll palaute näkyviin
  formNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Piilota automaattisesti 6 sekunnin kuluttua (vain virheviesti)
  if (type === 'error') {
    setTimeout(() => {
      formNotice.style.display = 'none';
      formNotice.className = 'form-notice';
    }, 6000);
  }
}

function validateForm(form) {
  const name  = form.querySelector('#name').value.trim();
  const phone = form.querySelector('#phone').value.trim();
  const email = form.querySelector('#email-input').value.trim();

  if (!name) {
    showNotice('error', 'Kirjoita nimesi ennen lähettämistä.');
    form.querySelector('#name').focus();
    return false;
  }

  if (!phone && !email) {
    showNotice('error', 'Anna joko puhelinnumero tai sähköpostiosoite, jotta voimme vastata.');
    form.querySelector('#phone').focus();
    return false;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showNotice('error', 'Sähköpostiosoite näyttää virheelliseltä – tarkista se.');
    form.querySelector('#email-input').focus();
    return false;
  }

  return true;
}

if (contactForm) {
  const submitBtn = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm(this)) return;

    // Lataustilateksti
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="spin-icon">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Lähetetään...
    `;

    try {
      const formData = new FormData(this);
      const response = await fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        showNotice('success', '✓ Viesti lähetetty! Palaamme asiaan pian.');
        contactForm.reset();
        // Piilota lomake onnistumisen jälkeen väliaikaisesti
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
      } else {
        const data = await response.json().catch(() => ({}));
        const errMsg = data?.errors?.[0]?.message || 'Jokin meni pieleen. Yritä uudelleen tai soita meille.';
        showNotice('error', errMsg);
        submitBtn.innerHTML = originalBtnContent;
        submitBtn.disabled = false;
      }
    } catch {
      showNotice('error', 'Yhteysvirhe – tarkista internetyhteys ja yritä uudelleen.');
      submitBtn.innerHTML = originalBtnContent;
      submitBtn.disabled = false;
    }
  });
}

/* ---- AKTIIVINEN NAVIGAATIOLINKKI SCROLLATESSA ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNavLink() {
  const scrollPos = window.scrollY + siteHeader.offsetHeight + 60;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < bottom) {
      navLinks.forEach(link => {
        link.removeAttribute('aria-current');
        link.style.color = '';
      });

      const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (activeLink) {
        activeLink.setAttribute('aria-current', 'page');
        activeLink.style.color = 'var(--purple-deep)';
      }
    }
  });
}

window.addEventListener('scroll', updateActiveNavLink, { passive: true });

/* ---- KUVAVIRHE-FALLBACK ---- */
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', function () {
    this.style.background = 'linear-gradient(135deg, var(--purple-pale), var(--orange-pale))';
    this.removeAttribute('src');
    this.setAttribute('alt', '');
    this.style.minHeight = '200px';
  });
});

/* ---- SPINNER-ANIMAATIO (CSS inject) ---- */
(function injectSpinnerStyle() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .spin-icon {
      animation: spin 0.9s linear infinite;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
})();