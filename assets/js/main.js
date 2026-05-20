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

  // --- Live market ticker ---
  const tickerTrack = document.getElementById('marketTickerTrack');
  const marketSymbols = [
    { label: 'S&P 500', symbol: '^spx', fallback: { close: 7353.61, prev: 7403.05, date: '2026-05-19' } },
    { label: 'NASDAQ', symbol: '^ndq', fallback: { close: 25870.71, prev: 26090.73, date: '2026-05-19' } },
    { label: 'DOW JONES', symbol: '^dji', fallback: { close: 49363.88, prev: 49686.12, date: '2026-05-19' } },
    { label: 'TSX', symbol: '^tsx', fallback: { close: 33741.24, prev: 33832.61, date: '2026-05-19' } },
    { label: 'GOLD', symbol: 'xauusd', fallback: { close: 4488.46, prev: 4558.16, date: '2026-05-20' } },
    { label: 'USD/CAD', symbol: 'usdcad', fallback: { close: 1.37549, prev: 1.37448, date: '2026-05-20' } }
  ];
  const encodeUrlParam = (value) => String(value).replace(/[%^&?=:/,]/g, (char) => ({
    '%': '%25',
    '^': '%5E',
    '&': '%26',
    '?': '%3F',
    '=': '%3D',
    ':': '%3A',
    '/': '%2F',
    ',': '%2C'
  })[char]);
  const stooqSymbol = (symbol) => String(symbol).replace(/\^/g, '%5E');
  const stooqUrl = (symbol) => `https://stooq.com/q/l/?s=${stooqSymbol(symbol)}&f=sd2t2ohlcvcp&h&e=csv`;
  const proxyUrl = (url) => `https://api.allorigins.win/raw?url=${encodeUrlParam(url)}`;
  const parseMarketCsv = (csv) => {
    const rows = csv.trim().split(/\r?\n/);
    if (rows.length < 2) throw new Error('No market rows returned');
    const headers = rows[0].split(',');
    const values = rows[1].split(',');
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
    const close = Number(row.Close);
    const prev = Number(row.Prev);
    if (!Number.isFinite(close) || !Number.isFinite(prev)) throw new Error('Invalid quote values');
    return { close, prev, date: row.Date };
  };
  const fetchQuote = async (item) => {
    const url = stooqUrl(item.symbol);
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 4500) : null;
    try {
      const response = await fetch(proxyUrl(url), { cache: 'no-store', signal: controller?.signal });
      if (!response.ok) throw new Error(`Market response ${response.status}`);
      return { ...item, ...(parseMarketCsv(await response.text())), live: true };
    } catch (error) {
      return { ...item, ...item.fallback, live: false };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  };
  const formatPrice = (label, value) => {
    const options = label === 'USD/CAD'
      ? { minimumFractionDigits: 4, maximumFractionDigits: 4 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return value.toLocaleString('en-US', options);
  };
  const renderTicker = (quotes) => {
    if (!tickerTrack || !quotes.length) return;
    const newestDate = quotes.find(q => q.date)?.date || '';
    const stamp = `<span class="ticker-item ticker-item--stamp"><strong>${quotes.some(q => q.live) ? 'LIVE MARKET' : 'MARKET CLOSE'}</strong>${newestDate}</span>`;
    const items = quotes.map((quote) => {
      const change = quote.close - quote.prev;
      const pct = quote.prev ? (change / quote.prev) * 100 : 0;
      const direction = change >= 0 ? 'up' : 'down';
      const arrow = change >= 0 ? '▲' : '▼';
      return `<span class="ticker-item"><strong>${quote.label}</strong> ${formatPrice(quote.label, quote.close)} <em class="${direction}">${arrow} ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%</em></span>`;
    }).join('');
    tickerTrack.innerHTML = `${stamp}${items}${stamp}${items}`;
  };
  if (tickerTrack) {
    if (tickerTrack.children.length < 4) {
      renderTicker(marketSymbols.map(item => ({ ...item, ...item.fallback, live: false })));
    }
    Promise.all(marketSymbols.map(fetchQuote)).then((quotes) => {
      if (quotes.some(quote => quote.live)) renderTicker(quotes);
    }).catch(() => {
      // Keep the complete server-rendered fallback ticker in place.
    });
  }

  // --- Homepage service modal ---
  const serviceDetails = {
    'family-protection': {
      eyebrow: 'Family Protection',
      title: '家庭保障规划',
      intro: '家庭保障规划从家庭成员、主要经济支柱、债务结构和潜在税务支出一起分析，核心目标是在风险发生时守住家庭生活、资产和责任。',
      points: [
        '确认家庭主要经济来源，以及父母、配偶、子女在风险发生后的真实资金需求。',
        '梳理房贷、商业贷款和其它债务，规划债务承接和资产保护方式。',
        '评估身故时可能产生的税务支出，并用合适的人寿保险保额提供流动性。'
      ]
    },
    'personal-investment': {
      eyebrow: 'Personal Investment',
      title: '个人投资规划',
      intro: '个人投资规划不只关注投什么，也关注使用什么账户投资。我们把注册账户、非注册账户和保险型资产放在同一套长期结构里比较。',
      points: [
        '比较 TFSA、RRSP、RESP 与非注册账户的税务特点和使用顺序。',
        '根据家庭现金流、教育金、退休目标和风险承受度配置投资账户。',
        '定期检视账户比例和投资方向，避免规划与人生阶段脱节。'
      ]
    },
    'corporate-insurance': {
      eyebrow: 'Corporate Insurance',
      title: '公司保单规划',
      intro: '公司保单规划帮助企业主把公司留存资金、税务效率、稳定增值和未来传承放在同一框架下处理。',
      points: [
        '评估公司资金是否高于日常运营所需，以及如何更有效部署。',
        '使用公司保单兼顾延税优税、资产保护和长期稳定增值。',
        '为企业传承或股东安排预留免税身故赔偿金带来的流动性。'
      ]
    },
    'leveraged-investment': {
      eyebrow: 'Leveraged Investment',
      title: '投资贷款计划',
      intro: '投资贷款计划通过财务杠杆提高潜在投资增长，但必须建立在现金流、风险承受度和长期策略都清楚的基础上。',
      points: [
        '评估是否适合使用银行资金参与投资，而不是单纯追求放大收益。',
        '规划利息支出、投资波动、可扣除利息费用和组合流动性。',
        '结合独立基金等工具，协助建立更清晰的杠杆投资边界。'
      ]
    },
    'critical-illness': {
      eyebrow: 'Critical Illness',
      title: '重疾保障计划',
      intro: '重疾保障计划关注公共医疗之外的成本，例如房贷、收入中断、康复交通、家庭照护和治疗期间的额外支出。',
      points: [
        '通过一次性赔付帮助客户在康复期保留选择权。',
        '不限用途，可用于家庭支出、债务、护理或治疗相关成本。',
        '与人寿保险、伤残保障和家庭现金流规划一起设计。'
      ]
    },
    'children-plan': {
      eyebrow: 'Children Plan',
      title: '儿童财务规划',
      intro: '儿童财务规划以长期陪伴为核心，覆盖教育、创业、成家、买房和未来退休等多个阶段。',
      points: [
        '结合 RESP 和儿童分红保险计划，为教育与长期资产建立基础。',
        '通过早期规划争取更长的复利时间和更稳定的保障成本。',
        '让父母或祖父母的支持以更有结构的方式延续给下一代。'
      ]
    },
    ifa: {
      eyebrow: 'Immediate Finance Arrangement',
      title: '保单融资规划 IFA',
      intro: 'IFA 是面向高净值客户和企业主的进阶策略，通过大额保单、银行融资和其它资产配置形成双轨增长。',
      points: [
        '先支付大额保费，再在符合条件下将已付保费从银行借出用于业务或投资。',
        '保单持续增长，同时原本用于保费的资金可投入房地产、基金、股票或生意运营。',
        '未来以免税身故赔偿金偿还贷款本金，余额留给受益人，实现借力传承。'
      ]
    },
    irp: {
      eyebrow: 'Insured Retirement Plan',
      title: '退休养老规划 IRP',
      intro: 'IRP 以分红式退休型保险为依托，为退休阶段建立更稳定、可预期且兼顾传承的现金流方案。',
      points: [
        '评估现有退休资金来源、账户限制和退休现金流缺口。',
        '通过保险退休计划补充传统注册账户之外的退休收入来源。',
        '兼顾退休生活、长期护理风险、配偶保障和下一代资产安排。'
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
