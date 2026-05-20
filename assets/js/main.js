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

  // --- Homepage service modal ---
  const serviceDetails = {
    mortgage: {
      eyebrow: 'Mortgage Management',
      title: '房贷与现金流管理',
      intro: '把房贷、家庭现金流与保障额度放在同一张图里看，避免单独追求低月供而忽略长期风险。',
      points: [
        '评估家庭收入、负债、紧急备用金和保费预算的平衡点。',
        '协助规划还款节奏、贷款保护和家庭主要收入来源的风险覆盖。',
        '根据人生阶段调整现金流安排，让保障和资产积累彼此配合。'
      ]
    },
    tax: {
      eyebrow: 'Tax Control',
      title: '税务控制策略',
      intro: '通过账户选择、保险工具和企业结构安排，减少财富积累与传承过程中的税务摩擦。',
      points: [
        '比较 TFSA、RRSP、RESP、非注册账户与保险型资产的使用顺序。',
        '为企业主评估公司留存资金、股东保障与税务效率。',
        '配合专业合作人士处理更复杂的税务和信托架构问题。'
      ]
    },
    asset: {
      eyebrow: 'Asset Appreciation',
      title: '资产增值规划',
      intro: '围绕风险承受度、时间周期和流动性需求，建立可持续调整的长期资产配置。',
      points: [
        '梳理家庭资产、负债、现金流和既有投资组合。',
        '选择适合不同账户属性的投资与保险解决方案。',
        '定期检视组合变化，避免规划和现实资产状态脱节。'
      ]
    },
    retirement: {
      eyebrow: 'Retirement Planning',
      title: '退休养老规划',
      intro: '提前规划退休收入来源、提款顺序、医疗风险与遗产安排，让退休生活更从容。',
      points: [
        '估算退休现金流缺口和不同账户的提款优先级。',
        '评估分红式保险、IRP 等方案在退休收入中的作用。',
        '兼顾配偶保障、长期护理风险与下一代资产安排。'
      ]
    },
    estate: {
      eyebrow: 'Estate Succession',
      title: '财富传承规划',
      intro: '让资产传承不只是“留给谁”，也包括如何更有效、更清楚、更少争议地完成交接。',
      points: [
        '梳理受益人、保单、公司资产和家庭成员责任。',
        '评估人寿保险在遗产税务和资产流动性中的作用。',
        '与法律、税务合作机构配合，形成更完整的传承方案。'
      ]
    },
    corporate: {
      eyebrow: 'Corporate Strategy',
      title: '企业策略规划',
      intro: '为企业主处理关键人风险、股东协议、公司资金效率和未来退出安排。',
      points: [
        '评估关键人保险、买卖协议资金来源和股东保障。',
        '分析公司留存资金如何配合保险和投资工具长期使用。',
        '为企业传承、退休退出和家庭资产保护建立清晰路线。'
      ]
    }
  };

  const serviceModal = document.getElementById('serviceModal');
  const serviceTitle = document.getElementById('serviceModalTitle');
  const serviceEyebrow = document.getElementById('serviceModalEyebrow');
  const serviceIntro = document.getElementById('serviceModalIntro');
  const serviceList = document.getElementById('serviceModalList');
  const serviceTriggers = document.querySelectorAll('[data-service-id]');
  const closeServiceModal = () => {
    if (!serviceModal) return;
    serviceModal.classList.remove('is-open');
    serviceModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };
  const openServiceModal = (id) => {
    const data = serviceDetails[id];
    if (!serviceModal || !data) return;
    serviceEyebrow.textContent = data.eyebrow;
    serviceTitle.textContent = data.title;
    serviceIntro.textContent = data.intro;
    serviceList.innerHTML = data.points.map(point => `<li>${point}</li>`).join('');
    serviceModal.classList.add('is-open');
    serviceModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const closeButton = serviceModal.querySelector('.service-modal__close');
    if (closeButton) closeButton.focus({ preventScroll: true });
  };
  serviceTriggers.forEach(trigger => {
    trigger.addEventListener('click', (event) => {
      const interactive = event.target.closest('button, a');
      if (!interactive) return;
      event.preventDefault();
      openServiceModal(trigger.dataset.serviceId);
    });
  });
  document.querySelectorAll('[data-service-close]').forEach(el => {
    el.addEventListener('click', closeServiceModal);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeServiceModal();
  });

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
