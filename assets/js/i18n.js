/* ===== Triton Wealth — i18n Language Switcher ===== */
(function () {
  'use strict';

  const STORAGE_KEY = 'triton-lang';
  const DEFAULT_LANG = 'zh';

  // ── Translation map ──────────────────────────────────────────────────────
  // Keys match data-i18n attributes on HTML elements.
  // Add new keys here as needed.
  const translations = {
    // ── Navigation ──
    'nav.home':       { zh: '主页',     en: 'Home' },
    'nav.about':      { zh: '关于我们', en: 'About' },
    'nav.services':   { zh: '服务范围', en: 'Services' },
    'nav.partners':   { zh: '合作伙伴', en: 'Partners' },
    'nav.workshops':  { zh: '富瑞讲堂', en: 'Workshops' },
    'nav.contact':    { zh: '联系我们', en: 'Contact' },

    // ── Footer ──
    'footer.tagline':     { zh: '加拿大华人家庭信赖的财富管理伙伴', en: 'Trusted wealth partner for Canadian families.' },
    'footer.tagline.alt': { zh: '专业 · 定制 · 长情陪伴',           en: 'Expertise · Tailored · Long-term Care' },
    'footer.nav':         { zh: 'Navigation', en: 'Navigation' },
    'footer.hours':       { zh: 'Office Hours', en: 'Office Hours' },
    'footer.contact':     { zh: 'Contact', en: 'Contact' },
    'footer.sat':         { zh: 'Saturday　Appointment', en: 'Saturday　By Appt.' },
    'footer.sun':         { zh: 'Sunday　　Appointment', en: 'Sunday　　By Appt.' },
    'footer.copy':        { zh: '© 2026 Triton Wealth Management Corporation 富瑞财富. All Rights Reserved.',
                            en: '© 2026 Triton Wealth Management Corporation. All Rights Reserved.' },

    // ── Index — Hero ──
    'hero.eyebrow':   { zh: 'Triton Wealth Management Corporation', en: 'Triton Wealth Management Corporation' },
    'hero.line1':     { zh: '专业守护',   en: 'Professional' },
    'hero.line2':     { zh: '每一份信赖', en: 'Every Trust' },
    'hero.line3':     { zh: '财富的每一步', en: 'Every Step of Wealth' },
    'hero.sub':       { zh: '背靠全加拿大 MGA 顶级总代理，总部位于温哥华，于 BC 省、安省及阿尔伯塔省持牌运营。凭借专业知识、灵活策略与丰富经验，为个人、家庭及中小企业提供全方位定制化的财富管理与传承咨询。',
                        en: 'Backed by Canada\'s top MGA, headquartered in Vancouver and licensed in BC, Ontario and Alberta. We deliver comprehensive, tailored wealth management and estate planning for individuals, families and businesses.' },
    'hero.btn.services': { zh: '了解我们的服务', en: 'Our Services' },
    'hero.btn.contact':  { zh: '预约免费咨询',   en: 'Book a Free Consultation' },
    'hero.stat1':     { zh: '年专业服务经验',     en: 'Years of Experience' },
    'hero.stat2':     { zh: '顶级代理合作保险公司', en: 'Top MGA Partner' },
    'hero.stat3':     { zh: '百万圆桌顶级会员',   en: 'MDRT Elite Member' },

    // ── Index — Intro ──
    'intro.eyebrow':  { zh: 'Why Choose Us', en: 'Why Choose Us' },
    'intro.title':    { zh: '为什么选择我们', en: 'Why Choose Us' },
    'intro.en':       { zh: 'Trust built upon expertise', en: 'Trust built upon expertise' },
    'intro.p1':       { zh: '富瑞财富 Triton Wealth Management Corporation 代理加拿大各大保险公司的投资和保险产品。凭着专业的知识、灵活的策略、丰富的经验与客户至上的服务宗旨，在过去多年服务了无数个华人家庭，深受客户的信任与喜爱。',
                        en: 'Triton Wealth Management Corporation represents leading Canadian insurance and investment products. With deep expertise, flexible strategies and a client-first philosophy, we have served countless families and earned their lasting trust.' },
    'intro.p2':       { zh: '我们的公司与顾问团队，针对个人、家庭以及中小企业，配合专业的合作机构，精于为客户提供全方位定制化、综合性的专业理财建议与咨询服务。',
                        en: 'Our advisors work with individuals, families and small businesses alongside specialist partners to deliver comprehensive, customized financial planning and advisory services.' },
    'feat1.title':    { zh: '顶级总代理背景', en: 'Top MGA Backing' },
    'feat1.desc':     { zh: '背靠全加拿大 MGA 顶级总代理，资源整合、产品全面。', en: 'Backed by Canada\'s premier MGA — broad product access and integrated resources.' },
    'feat2.title':    { zh: '跨省持牌专业', en: 'Multi-Province Licensed' },
    'feat2.desc':     { zh: 'BC、安省、阿尔伯塔省合规持牌，专业资质值得信赖。', en: 'Fully licensed in BC, Ontario and Alberta — professional credentials you can trust.' },
    'feat3.title':    { zh: '定制化方案', en: 'Tailored Solutions' },
    'feat3.desc':     { zh: '个人 · 家庭 · 中小企业，量身打造的全方位规划。', en: 'Individuals · Families · Businesses — bespoke plans built around your goals.' },
    'feat4.title':    { zh: '客户至上', en: 'Client First' },
    'feat4.desc':     { zh: '长期陪伴，从财富积累到代际传承的全周期顾问。', en: 'Long-term partnership — from wealth accumulation to multi-generational legacy.' },

    // ── Index — Services ──
    'svc.eyebrow':    { zh: 'Our Services', en: 'Our Services' },
    'svc.title':      { zh: '我们的服务', en: 'Our Services' },
    'svc.en':         { zh: 'Comprehensive wealth solutions', en: 'Comprehensive wealth solutions' },
    'svc.desc':       { zh: '从家庭保障到企业传承，从税务优化到信托架构 — 我们提供八大核心服务，覆盖人生与财富的每个关键阶段。',
                        en: 'From family protection to corporate succession, tax optimization to trust structures — eight core services covering every key stage of life and wealth.' },
    'svc1.title':     { zh: '家庭保障规划', en: 'Family Protection' },
    'svc1.desc':      { zh: '以家庭经济支柱为核心，合理配置人寿保险保额，守护至亲，规避债务与税务风险。', en: 'Centred on the family breadwinner — right-sizing life insurance to protect loved ones and mitigate debt and tax risks.' },
    'svc2.title':     { zh: '个人投资规划', en: 'Personal Investment' },
    'svc2.desc':      { zh: 'TFSA、RRSP、RESP 等注册账户与非注册账户的全盘配置，长线增值与税务筹划并重。', en: 'Holistic allocation across TFSA, RRSP, RESP and non-registered accounts — balancing long-term growth with tax efficiency.' },
    'svc3.title':     { zh: '公司保单规划', en: 'Corporate Insurance' },
    'svc3.desc':      { zh: '稳定增值 · 延税优税 · 放大传承 — 企业主优化公司净值与税务的核心工具。', en: 'Steady growth · Tax deferral · Legacy amplification — the cornerstone tool for business owners to optimize corporate equity and taxes.' },
    'svc4.title':     { zh: '投资贷款计划', en: 'Leveraged Investment' },
    'svc4.desc':      { zh: '合理利用银行杠杆，加速财富增长，扩大投资组合，享受可扣除利息费等多重优势。', en: 'Leverage bank capital to accelerate wealth growth, diversify your portfolio and benefit from deductible interest.' },
    'svc5.title':     { zh: '重疾保障计划', en: 'Critical Illness' },
    'svc5.desc':      { zh: '一次性赔付、不限用途，弥补公共医疗外的真空地带，减轻康复期家庭财务压力。', en: 'Lump-sum payout with no restrictions — bridging the gap beyond public healthcare and easing financial pressure during recovery.' },
    'svc6.title':     { zh: '儿童财务规划', en: "Children's Plan" },
    'svc6.desc':      { zh: '分红式儿童保险，惠及祖孙三代，从教育到创业、婚嫁、养老的百年长情陪伴。', en: 'Participating children\'s insurance benefiting three generations — lifelong support from education to retirement.' },
    'svc7.title':     { zh: '保单融资规划 IFA', en: 'IFA Financing' },
    'svc7.desc':      { zh: 'Immediate Finance Arrangement —「四两拨千斤」实现财富双倍增值的高净值方案。', en: 'Immediate Finance Arrangement — leverage a policy to double your wealth with minimal capital outlay.' },
    'svc8.title':     { zh: '退休养老规划', en: 'Retirement Strategy' },
    'svc8.desc':      { zh: '以分红式退休型保险为依托建立保险退休计划 IRP，让退休生活从容而丰盈。', en: 'Build an Insured Retirement Plan (IRP) on participating insurance — a comfortable and abundant retirement.' },

    // ── Index — CTA ──
    'cta.eyebrow':    { zh: 'Get In Touch', en: 'Get In Touch' },
    'cta.title':      { zh: '每一份信任<br/>都值得被认真对待', en: 'Every Trust<br/>Deserves Serious Care' },
    'cta.desc':       { zh: '无论您正在规划家庭保障、退休生活，还是企业财富传承，<br/>富瑞财富的专业顾问团队都将为您量身打造合适的方案。',
                        en: 'Whether you\'re planning family protection, retirement or business succession,<br/>our advisors will craft the right solution for you.' },
    'cta.btn':        { zh: '预约咨询', en: 'Book a Consultation' },

    // ── About ──
    'about.h1':       { zh: '专业团队 · 值得托付', en: 'A Team You Can Trust' },
    'about.lead':     { zh: '富瑞财富由资深金融顾问创立，团队成员均为业界顶级专业人士，长期专注于为家庭与企业提供综合性财富管理与传承咨询服务。',
                        en: 'Founded by seasoned financial advisors, our team comprises top industry professionals dedicated to comprehensive wealth management and estate planning for families and businesses.' },
    'about.team.eyebrow': { zh: 'Meet Our Team', en: 'Meet Our Team' },
    'about.team.title':   { zh: '创始合伙人', en: 'Founding Partners' },
    'jeffrey.role':   { zh: 'President · Founder &amp; Partner', en: 'President · Founder &amp; Partner' },
    'jeffrey.li1':    { zh: '全球金融百万圆桌会（MDRT）顶级成员（TOT）', en: 'MDRT Top of the Table (TOT) Member' },
    'jeffrey.li2':    { zh: '加拿大注册退休顾问 RRC', en: 'Registered Retirement Consultant (RRC)' },
    'jeffrey.li3':    { zh: '资深保险和投资顾问', en: 'Senior Insurance & Investment Advisor' },
    'jeffrey.li4':    { zh: '富瑞财商课程首席讲师', en: 'Lead Instructor, Triton Financial Literacy Program' },
    'claire.role':    { zh: 'Director', en: 'Director' },
    'claire.li1':     { zh: '全球金融百万圆桌会（MDRT）内阁成员（COT）', en: 'MDRT Court of the Table (COT) Member' },
    'claire.li2':     { zh: '资深保险和投资顾问', en: 'Senior Insurance & Investment Advisor' },
    'claire.li3':     { zh: '富瑞财商课程高级讲师', en: 'Senior Instructor, Triton Financial Literacy Program' },
    'claire.li4':     { zh: 'LLQP 培训讲师', en: 'LLQP Training Instructor' },
    'about.phil.eyebrow': { zh: 'Our Philosophy', en: 'Our Philosophy' },
    'about.phil.title':   { zh: '理念与使命', en: 'Values & Mission' },
    'about.phil.p1':  { zh: '富瑞财富 Triton Wealth Management Corporation 背靠全加拿大 MGA 顶级总代理，总部位于温哥华，于 BC 省、安省及阿尔伯塔省持牌运营，代理加拿大各大保险公司的投资和保险产品。',
                        en: 'Triton Wealth Management Corporation is backed by Canada\'s top MGA, headquartered in Vancouver and licensed in BC, Ontario and Alberta, representing leading Canadian insurance and investment products.' },
    'about.phil.p2':  { zh: '凭借专业的知识、灵活的策略、丰富的经验以及客户至上的服务宗旨，富瑞财富在过去多年服务了无数家庭，深受客户的信任与喜爱。',
                        en: 'With deep expertise, flexible strategies and a client-first philosophy, Triton has served countless families over the years and earned their enduring trust.' },
    'about.phil.p3':  { zh: '我们的公司与顾问团队，针对个人、家庭以及中小企业，配合专业的合作机构，精于为客户提供全方位定制化的综合性专业理财建议与咨询服务。',
                        en: 'Our advisors work with individuals, families and businesses alongside specialist partners to deliver comprehensive, customized financial planning and advisory services.' },
    'val1.title':     { zh: '专业 Expertise', en: 'Expertise' },
    'val1.desc':      { zh: 'MDRT 顶级成员，深厚的行业经验与专业积淀。', en: 'MDRT elite members with deep industry experience and professional credentials.' },
    'val2.title':     { zh: '诚信 Integrity', en: 'Integrity' },
    'val2.desc':      { zh: '透明 · 真诚 · 站在客户立场提供建议。', en: 'Transparent · Honest · Always advising in your best interest.' },
    'val3.title':     { zh: '定制 Tailored', en: 'Tailored' },
    'val3.desc':      { zh: '没有"标准方案"，只有适合您的方案。', en: 'No cookie-cutter plans — only solutions built around you.' },
    'val4.title':     { zh: '长情 Long-term', en: 'Long-term' },
    'val4.desc':      { zh: '从财富积累到代际传承的全周期陪伴。', en: 'Full-lifecycle partnership from wealth building to generational legacy.' },
    'about.cta.title': { zh: '开始一段<br/>值得信赖的合作', en: 'Start a Partnership<br/>Built on Trust' },
    'about.cta.desc':  { zh: '欢迎预约一次免费的初步咨询，<br/>让我们的顾问团队为您的财富规划提供专业建议。',
                         en: 'Book a free initial consultation and let our advisors provide expert guidance for your wealth plan.' },

    // ── Services page ──
    'sp.h1':          { zh: '八大核心服务<br/>覆盖财富每个阶段', en: 'Eight Core Services<br/>For Every Stage of Wealth' },
    'sp.lead':        { zh: '富瑞财富代理加拿大各大保险公司的投资和保险产品，凭着专业的知识、灵活的策略与丰富的经验，针对个人、家庭以及中小企业，提供全方位定制化的综合性专业理财建议与咨询服务。',
                        en: 'Triton Wealth represents leading Canadian insurance and investment products. With expertise, flexible strategies and experience, we deliver comprehensive, tailored financial advice for individuals, families and businesses.' },
    'sp.intro.p':     { zh: '我们的服务覆盖范围包括但不限于：', en: 'Our services include but are not limited to:' },
    'sp.h1.1':        { zh: '家庭保障规划', en: 'Family Protection Planning' },
    'sp.h1.2':        { zh: '个人投资规划', en: 'Personal Investment Planning' },
    'sp.h1.3':        { zh: '公司保单规划', en: 'Corporate Insurance Planning' },
    'sp.h1.4':        { zh: '投资贷款计划', en: 'Leveraged Investment Plan' },
    'sp.h1.5':        { zh: '重疾保障计划', en: 'Critical Illness Plan' },
    'sp.h1.6':        { zh: '儿童财务规划', en: "Children's Financial Plan" },
    'sp.h1.7':        { zh: '保单融资规划 IFA', en: 'IFA Policy Financing' },
    'sp.h1.8':        { zh: '退休养老规划', en: 'Retirement Strategy' },
    'sp.cta.title':   { zh: '没有一套方案<br/>能适合所有人', en: 'No Single Plan<br/>Fits Everyone' },
    'sp.cta.desc':    { zh: '每一份规划都应基于您独特的家庭结构、资产状况与人生目标。<br/>欢迎预约我们的顾问，开启您的专属财富方案。',
                        en: 'Every plan should reflect your unique family structure, assets and life goals.<br/>Book an advisor to start your bespoke wealth strategy.' },

    // ── Partners ──
    'pt.h1':          { zh: '值得信赖的合作机构', en: 'Trusted Partner Network' },
    'pt.lead':        { zh: '富瑞财富作为全加拿大 MGA 顶级总代理旗下机构，与加拿大主要保险公司及银行建立了长期稳定的合作关系，为客户提供丰富、优质且具竞争力的金融产品选择。',
                        en: 'As part of Canada\'s top MGA network, Triton Wealth has established long-term partnerships with leading insurers and banks, giving clients access to a broad, competitive range of financial products.' },
    'pt.ins.title':   { zh: '代理保险公司', en: 'Insurance Carriers' },
    'pt.bank.title':  { zh: '合作银行', en: 'Banking Partners' },
    'pt.note':        { zh: '* 实际合作品牌以最新签约清单为准', en: '* Actual partner brands subject to latest signed agreements.' },
    'pt.cta.title':   { zh: '更多产品选择<br/>更优策略组合', en: 'More Product Choice<br/>Better Strategy Mix' },
    'pt.cta.desc':    { zh: '欢迎咨询，我们的顾问将根据您的需求，<br/>从合作伙伴产品中筛选最合适的方案。',
                        en: 'Contact us and our advisors will select the best-fit products from our partner network for your needs.' },

    // ── Workshops ──
    'ws.h1':          { zh: '富瑞讲堂', en: 'Triton Workshops' },
    'ws.lead':        { zh: '富瑞财富长期举办系列理财讲座与财商课程，将复杂的金融知识转化为简明、实用的内容，帮助客户与社区做出更聪明的财富决策。',
                        en: 'Triton Wealth regularly hosts financial literacy workshops and seminars, translating complex financial concepts into clear, actionable insights to help clients and the community make smarter wealth decisions.' },
    'ws.series':      { zh: '富瑞财商课程系列', en: 'Triton Financial Literacy Series' },
    'ws.special':     { zh: '专题讲座', en: 'Special Topics' },
    'ws.coming':      { zh: '更多讲座持续更新中', en: 'More Workshops Coming Soon' },
    'ws.coming.p':    { zh: '欢迎关注我们的最新动态，或直接联系顾问获取讲座资料与报名信息。', en: 'Follow our latest updates or contact an advisor for workshop materials and registration.' },
    'ws.cta.title':   { zh: '关注下一场讲座', en: 'Stay Informed' },
    'ws.cta.desc':    { zh: '富瑞讲堂不定期举办专题分享与一对一咨询日，<br/>欢迎留下联系方式，第一时间收到通知。',
                        en: 'Triton Workshops hosts regular topic sessions and one-on-one advisory days.<br/>Leave your contact details to be the first to know.' },

    // ── Contact ──
    'ct.h1':          { zh: '开始一段专业对话', en: 'Start a Professional Conversation' },
    'ct.lead':        { zh: '无论是初次咨询还是已有方案的优化，我们的顾问团队都欢迎您的来访。欢迎通过下方任一方式联系我们，或预约一次免费的初步咨询。',
                        en: 'Whether it\'s your first consultation or refining an existing plan, our advisors welcome you. Reach out through any channel below or book a free initial consultation.' },
    'ct.form.title':  { zh: '发送咨询信息', en: 'Send Us a Message' },
    'ct.form.desc':   { zh: '填写下方表单，告诉我们您的需求与目标。我们的顾问将在一个工作日内主动联系您。',
                        en: 'Fill in the form below and tell us your needs and goals. An advisor will reach out within one business day.' },
    'ct.lbl.name':    { zh: '姓名', en: 'Name' },
    'ct.lbl.phone':   { zh: '电话', en: 'Phone' },
    'ct.lbl.email':   { zh: '邮箱', en: 'Email' },
    'ct.lbl.type':    { zh: '咨询类型', en: 'Inquiry Type' },
    'ct.lbl.msg':     { zh: '留言', en: 'Message' },
    'ct.opt0':        { zh: '请选择…', en: 'Please select…' },
    'ct.opt1':        { zh: '家庭保障规划', en: 'Family Protection' },
    'ct.opt2':        { zh: '个人投资规划', en: 'Personal Investment' },
    'ct.opt3':        { zh: '公司保单规划', en: 'Corporate Insurance' },
    'ct.opt4':        { zh: '退休养老规划', en: 'Retirement Planning' },
    'ct.opt5':        { zh: '财富传承 / 信托', en: 'Estate / Trust' },
    'ct.opt6':        { zh: '其他', en: 'Other' },
    'ct.btn.send':    { zh: '发送咨询', en: 'Send Message' },
    'ct.aside.title': { zh: '随时欢迎您的联系', en: 'We\'re Always Here' },
    'ct.aside.desc':  { zh: '如果您希望尽快得到回应，欢迎直接拨打电话，或预约线下 / 视频会面。',
                        en: 'For a faster response, call us directly or book an in-person or video meeting.' },
    'ct.hours.sat':   { zh: '预约制', en: 'By Appt.' },
    'ct.map.btn':     { zh: '#1200 – 1200 W 73rd Ave, Vancouver', en: '#1200 – 1200 W 73rd Ave, Vancouver' },
    'ct.map.open':    { zh: '在 Google Maps 打开', en: 'Open in Google Maps' },
    'ct.faq.title':   { zh: '咨询前常见问题', en: 'Frequently Asked Questions' },
    'ct.faq1.q':      { zh: '初次咨询需要收费吗？', en: 'Is the first consultation free?' },
    'ct.faq1.a':      { zh: '不需要。我们提供免费的初步咨询，帮助您梳理财富现状与目标，再决定是否进一步合作。',
                        en: 'Yes, completely free. We offer a complimentary initial consultation to help you clarify your financial situation and goals before deciding on next steps.' },
    'ct.faq2.q':      { zh: '咨询时需要准备哪些资料？', en: 'What should I prepare for the consultation?' },
    'ct.faq2.a':      { zh: '建议准备：现有保单概览、家庭收支大致情况、资产负债清单、退休或传承的初步想法。无需精确数字，初步沟通时大致区间即可。',
                        en: 'We suggest: an overview of existing policies, a rough picture of household income and expenses, an asset and liability summary, and initial thoughts on retirement or estate goals. Exact figures are not required at this stage.' },
    'ct.faq3.q':      { zh: '可以远程视频咨询吗？', en: 'Can I consult remotely via video?' },
    'ct.faq3.a':      { zh: '可以。我们支持 Zoom、微信等视频方式，方便不在温哥华或卡尔加里的客户进行远程沟通。',
                        en: 'Absolutely. We support Zoom, WeChat and other video platforms, making it easy for clients outside Vancouver or Calgary to connect remotely.' },
    'ct.faq4.q':      { zh: '你们的服务覆盖哪些省份？', en: 'Which provinces do you serve?' },
    'ct.faq4.a':      { zh: '我们在 BC 省、安省（Ontario）以及阿尔伯塔省（Alberta）持牌运营，可为这三省的居民提供合规的保险与投资咨询服务。',
                        en: 'We are licensed in BC, Ontario and Alberta and can provide compliant insurance and investment advisory services to residents of all three provinces.' },
  };

  // ── Core switcher ────────────────────────────────────────────────────────
  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
    updateToggle(lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }

  function applyLang(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const map = translations[key];
      if (!map) return;
      const text = map[lang] || map[DEFAULT_LANG];
      // Use innerHTML for entries that contain HTML tags (e.g. <br/>)
      if (text.includes('<')) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    // Placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const map = translations[key];
      if (!map) return;
      el.placeholder = map[lang] || map[DEFAULT_LANG];
    });
  }

  function updateToggle(lang) {
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.querySelectorAll('[data-lang]').forEach(span => {
        span.classList.toggle('active', span.dataset.lang === lang);
      });
    });
  }

  // ── Build toggle button ──────────────────────────────────────────────────
  function buildToggle() {
    const btn = document.createElement('div');
    btn.className = 'lang-toggle';
    btn.setAttribute('role', 'group');
    btn.setAttribute('aria-label', 'Language');
    btn.innerHTML =
      '<span data-lang="zh" class="active" tabindex="0" role="button" aria-pressed="true">中</span>' +
      '<span class="lang-sep">/</span>' +
      '<span data-lang="en" tabindex="0" role="button" aria-pressed="false">EN</span>';

    btn.querySelectorAll('[data-lang]').forEach(span => {
      span.addEventListener('click', () => setLang(span.dataset.lang));
      span.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLang(span.dataset.lang); }
      });
    });
    return btn;
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Insert toggle into every nav-wrap
    document.querySelectorAll('.nav-wrap').forEach(wrap => {
      const toggle = buildToggle();
      // Insert before the hamburger button (or at end)
      const hamburger = wrap.querySelector('.nav-toggle');
      if (hamburger) wrap.insertBefore(toggle, hamburger);
      else wrap.appendChild(toggle);
    });

    const lang = getLang();
    applyLang(lang);
    updateToggle(lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  });

})();
