/* ===== Triton Wealth Management - main.js ===== */
(function () {
  'use strict';

  // --- Sticky header ---
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile menu ---
  const toggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');
  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      navList.classList.toggle('open');
    });
    navList.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        navList.classList.remove('open');
      });
    });
  }

  // --- Active nav ---
  const normalizePath = (value) => {
    const url = new URL(value, location.origin);
    const pathname = url.pathname.replace(/\/index\.html$/, '/');
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  };
  const path = normalizePath(location.href);
  document.querySelectorAll('.nav-list a').forEach(a => {
    const href = normalizePath(a.getAttribute('href'));
    if (href === path) a.classList.add('active');
    else a.classList.remove('active');
  });

  // --- Contact form mailto fallback ---
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(contactForm);
      const name = (data.get('姓名') || '').toString().trim();
      const phone = (data.get('电话') || '').toString().trim();
      const email = (data.get('邮箱') || '').toString().trim();
      const type = (data.get('咨询类型') || '').toString().trim();
      const message = (data.get('留言') || '').toString().trim();
      const subject = `Triton Wealth 咨询${name ? ` - ${name}` : ''}`;
      const body = [
        `姓名: ${name}`,
        `电话: ${phone || '未填写'}`,
        `邮箱: ${email}`,
        `咨询类型: ${type || '未选择'}`,
        '',
        '留言:',
        message || '未填写'
      ].join('\n');
      window.location.href = `mailto:info@tritonwealth.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  // --- Reveal on scroll ---
  const revealTargets = document.querySelectorAll(
    '.intro-grid, .service-card, .cta-inner, .feature-item, .section-head, .testimonial-head, .testimonial-card'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 140);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in'));
  }

  // --- Animated number counter (slow & dignified) ---
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 2800;
    const start = performance.now();
    const plus = el.querySelector('.plus');
    const easeOut = t => 1 - Math.pow(1 - t, 4);
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const val = Math.floor(easeOut(p) * target);
      if (el.firstChild && el.firstChild.nodeType === 3) {
        el.firstChild.textContent = val;
      } else {
        el.textContent = val;
      }
      if (plus) el.appendChild(plus);
      if (p < 1) requestAnimationFrame(step);
      else if (suffix && !plus) el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => co.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  // --- Service card spotlight follow ---
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });

  // --- Hero orb parallax on mousemove (gentle, eased) ---
  const orbs = document.querySelectorAll('.orb');
  if (orbs.length && window.matchMedia('(hover: hover)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, rafId = null;
    const loop = () => {
      cx += (tx - cx) * 0.04;
      cy += (ty - cy) * 0.04;
      orbs.forEach((o, i) => {
        const k = (i + 1) * 8;
        o.style.translate = `${cx * k}px ${cy * k}px`;
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) rafId = requestAnimationFrame(loop);
      else rafId = null;
    };
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (!rafId) rafId = requestAnimationFrame(loop);
    });
  }
})();
