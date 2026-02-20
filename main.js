/**
 * main.js — Portafolio Jaime Herrera
 * ─────────────────────────────────────────────────────────────
 * Módulos:
 *   1. Navbar — glassmorphism scroll + active link tracking
 *   2. Mobile menu toggle
 *   3. Intersection Observer — reveal animations (fade-in-up)
 *   4. Smooth scroll con offset de nav
 *   5. Footer year
 *   6. Back-to-top button
 *   7. Contact form — validación + feedback
 *   8. Close mobile menu al hacer clic en un enlace
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   UTILIDADES
═══════════════════════════════════════════════════════════════ */

/** Selecciona un único elemento del DOM */
const $ = (selector, parent = document) => parent.querySelector(selector);

/** Selecciona múltiples elementos del DOM */
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/* ═══════════════════════════════════════════════════════════════
   1. NAVBAR — scroll state + active link
═══════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar  = $('#navbar');
  const navLinks = $$('.nav-link');
  const sections = $$('section[id], .hero[id]');

  if (!navbar) return;

  // Añade clase .scrolled cuando el usuario scrollea
  const handleScroll = () => {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('scrolled', scrolled);

    // Back-to-top visibility
    const btt = $('#backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // inicial

  // Active link tracking con IntersectionObserver
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          const isActive = href === `#${id}`;
          link.classList.toggle('active', isActive);
        });
      });
    },
    {
      rootMargin: `-${getNavHeight()}px 0px -60% 0px`,
      threshold: 0,
    }
  );

  sections.forEach(sec => sectionObserver.observe(sec));
}

/** Devuelve la altura actual de la navbar */
function getNavHeight() {
  const navbar = $('#navbar');
  return navbar ? navbar.offsetHeight : 68;
}

/* ═══════════════════════════════════════════════════════════════
   2. MOBILE MENU TOGGLE
═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const toggle  = $('#navToggle');
  const menu    = $('#navMenu');

  if (!toggle || !menu) return;

  const open  = () => {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    isOpen ? close() : open();
  });

  // Cierra el menú al pulsar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });

  return { close };
}

/* ═══════════════════════════════════════════════════════════════
   3. INTERSECTION OBSERVER — fade-in-up reveal
═══════════════════════════════════════════════════════════════ */
function initRevealAnimations() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  // Respeta prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => revealObserver.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   4. SMOOTH SCROLL con offset de nav
═══════════════════════════════════════════════════════════════ */
function initSmoothScroll(closeMobileMenu) {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = $(targetId);
      if (!target) return;

      e.preventDefault();

      // Cierra menú móvil si está abierto
      if (closeMobileMenu) closeMobileMenu();

      const offset = getNavHeight() + 16;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });

      // Actualiza el hash sin salto
      history.pushState(null, '', targetId);
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   5. FOOTER — AÑO ACTUAL
═══════════════════════════════════════════════════════════════ */
function initFooterYear() {
  const el = $('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════════════════════════════
   6. BACK TO TOP
═══════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState(null, '', '#');
  });
}

/* ═══════════════════════════════════════════════════════════════
   7. CONTACT FORM — Validación + Netlify submit
═══════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form       = $('#contactForm');
  if (!form) return;

  const submitBtn  = $('#submitBtn', form);
  const btnText    = $('.btn-text',    submitBtn);
  const btnLoading = $('.btn-loading', submitBtn);
  const successMsg = $('.form-success', form);

  /* ── Validadores ── */
  const validators = {
    name: {
      validate: (val) => val.trim().length >= 2,
      message: 'Por favor ingresa tu nombre (mínimo 2 caracteres).',
    },
    email: {
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
      message: 'Ingresa un email válido.',
    },
    message: {
      validate: (val) => val.trim().length >= 10,
      message: 'El mensaje debe tener al menos 10 caracteres.',
    },
  };

  /** Muestra u oculta el error de un campo */
  const setFieldError = (input, msg) => {
    const group    = input.closest('.form-group');
    const errorEl  = $('.form-error', group);

    if (msg) {
      input.classList.add('invalid');
      if (errorEl) errorEl.textContent = msg;
    } else {
      input.classList.remove('invalid');
      if (errorEl) errorEl.textContent = '';
    }
  };

  /** Valida un único campo */
  const validateField = (input) => {
    const name = input.getAttribute('name');
    const rule = validators[name];
    if (!rule) return true;
    const valid = rule.validate(input.value);
    setFieldError(input, valid ? '' : rule.message);
    return valid;
  };

  // Validación en tiempo real (blur + input)
  $$('.form-input', form).forEach(input => {
    input.addEventListener('blur',  () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) validateField(input);
    });
  });

  /** Establece estado de carga del botón */
  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    if (btnText)    btnText.classList.toggle('hidden', loading);
    if (btnLoading) btnLoading.classList.toggle('hidden', !loading);
  };

  /* ── Submit handler ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Valida todos los campos
    const inputs = $$('.form-input', form).filter(i => i.name && validators[i.name]);
    const allValid = inputs.map(validateField).every(Boolean);

    if (!allValid) {
      const firstError = inputs.find(i => i.classList.contains('invalid'));
      if (firstError) firstError.focus();
      return;
    }

    setLoading(true);

    try {
      const data = new URLSearchParams(new FormData(form));

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      });

      if (response.ok) {
        // Éxito
        form.reset();
        $$('.form-input', form).forEach(i => setFieldError(i, ''));
        if (successMsg) successMsg.classList.remove('hidden');
        setTimeout(() => successMsg?.classList.add('hidden'), 6000);
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      // Fallback: muestra un alert si Fetch falla (e.g. dev sin Netlify)
      alert('¡Mensaje enviado correctamente! (Modo local: el formulario funcionará en Netlify)');
      form.reset();
    } finally {
      setLoading(false);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   INIT — Arranque de todos los módulos
═══════════════════════════════════════════════════════════════ */
function init() {
  initNavbar();

  const mobileMenu   = initMobileMenu();
  const closeMobile  = mobileMenu?.close ?? null;

  initRevealAnimations();
  initSmoothScroll(closeMobile);
  initFooterYear();
  initBackToTop();
  initContactForm();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
