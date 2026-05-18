#!/usr/bin/env python3
"""
Triton Wealth SEO updater
Injects/updates: title, description, keywords, OG, Twitter, geo, theme,
and shared LocalBusiness JSON-LD into all HTML pages (flat + pretty URL).
Re-run safely — replaces existing SEO block on each pass.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
DOMAIN = "https://www.tritonwealth.ca"

# --------------------------------------------------------------------
# Page-level SEO config
# --------------------------------------------------------------------
PAGES = {
    "index.html": {
        "url": f"{DOMAIN}/",
        "title": "富瑞财富 Triton Wealth Management | 温哥华华人理财顾问 · 保险投资退休规划",
        "description": "富瑞财富 Triton Wealth Management — 加拿大温哥华华人理财顾问，BC、安省、阿尔伯塔省持牌运营，提供保险、投资、退休规划、家族信托、财富传承定制方案。MDRT 顶级会员团队，预约免费咨询。",
        "keywords": "温哥华理财顾问,加拿大华人理财,富瑞财富,Triton Wealth,加拿大保险,BC保险,温哥华保险,卡尔加里理财,MDRT顾问,RRSP,TFSA,RESP,退休规划,家族信托,IFA保单融资,财富传承,公司保单,儿童分红保险",
        "og_type": "website",
    },
    "about.html": {
        "url": f"{DOMAIN}/about/",
        "title": "关于我们 | Jeffrey Yuan · Claire Qiu | 富瑞财富 MDRT 顶级顾问团队",
        "description": "认识富瑞财富创始团队 — Jeffrey Yuan（MDRT TOT 顶级成员、加拿大注册退休顾问 RRC）与 Claire Qiu（MDRT COT 内阁成员、LLQP 培训讲师），10+ 年加拿大华人理财服务经验，专业守护每一份信赖。",
        "keywords": "Jeffrey Yuan,Claire Qiu,富瑞财富顾问,MDRT顾问,温哥华华人理财顾问,加拿大注册退休顾问RRC,LLQP培训讲师,华人保险顾问",
        "og_type": "profile",
    },
    "services.html": {
        "url": f"{DOMAIN}/services/",
        "title": "服务范围 | 八大核心财富方案 | 富瑞财富 Triton Wealth Management",
        "description": "富瑞财富八大核心服务：家庭保障规划、个人投资 (TFSA/RRSP/RESP)、公司保单、投资贷款、重疾保障、儿童分红保险、IFA 保单融资、退休养老 IRP，覆盖个人 / 家庭 / 中小企业的全周期财富需求。",
        "keywords": "加拿大保险规划,家庭保障规划,个人投资规划,公司保单,投资贷款,重疾保障,儿童分红保险,IFA保单融资,退休养老规划IRP,RRSP退休账户,TFSA免税账户,RESP教育储蓄,人寿保险,温哥华保险",
        "og_type": "website",
    },
    "partners.html": {
        "url": f"{DOMAIN}/partners/",
        "title": "合作伙伴 | 加拿大主流保险公司与银行 | 富瑞财富",
        "description": "富瑞财富代理加拿大主流保险公司（Manulife、Sun Life、Canada Life、iA Financial、Equitable Life、BMO Insurance、Desjardins、Foresters 等 15 家）及合作银行（BMO Private Banking、Scotia Wealth、National Bank、Manulife Bank、B2B Bank、EQ Bank），为客户提供广泛专业的产品选择。",
        "keywords": "加拿大保险公司,Manulife宏利,Sun Life永明,Canada Life加拿大人寿,iA Financial,Equitable Life,BMO Insurance,Desjardins,Foresters,Allianz,Alberta Blue Cross,Tugo,合作银行,BMO Private Banking,Scotia Wealth,National Bank,Manulife Bank,B2B Bank,EQ Bank",
        "og_type": "website",
    },
    "workshops.html": {
        "url": f"{DOMAIN}/workshops/",
        "title": "富瑞讲堂 | 加拿大理财讲座 · 财商课程 | 富瑞财富",
        "description": "富瑞讲堂 — 8 讲富瑞财商课程系列 + 4 个专题讲座（IFA 保单融资、RRSP 退休账户、RESP 教育储蓄、Manulife Vitality 健康保险），免费参与，将复杂金融知识转化为简明实用内容，帮您做出更聪明的财富决策。",
        "keywords": "加拿大理财讲座,温哥华理财课程,华人财商课程,IFA讲座,RRSP讲座,RESP讲座,Manulife Vitality,富瑞讲堂,免费理财讲座",
        "og_type": "website",
    },
    "contact.html": {
        "url": f"{DOMAIN}/contact/",
        "title": "联系我们 | 温哥华办公室 · 预约免费咨询 | 富瑞财富",
        "description": "富瑞财富温哥华办公室：#1500 - 1200 W 73rd Avenue, Vancouver, BC V6P 6G5。电话 BC 778.837.6688 / 604.345.5188，AB 403.869.6886。Email info@tritonwealth.ca。营业时间 Mon-Fri 9:00-17:00，欢迎预约免费初步咨询。",
        "keywords": "联系富瑞财富,温哥华理财顾问联系方式,Vancouver financial advisor,免费咨询预约,Triton Wealth contact",
        "og_type": "website",
    },
    "legal-disclaimers.html": {
        "url": f"{DOMAIN}/legal-disclaimers/",
        "title": "Legal & Disclaimers | 法律声明 | 富瑞财富",
        "description": "Triton Wealth Management Corporation 法律声明与免责条款。",
        "keywords": "",
        "og_type": "website",
        "noindex": True,
    },
    "terms.html": {
        "url": f"{DOMAIN}/terms/",
        "title": "Terms and Conditions | 使用条款 | 富瑞财富",
        "description": "Triton Wealth Management Corporation 网站使用条款。",
        "keywords": "",
        "og_type": "website",
        "noindex": True,
    },
}

# --------------------------------------------------------------------
# Shared LocalBusiness / FinancialService JSON-LD
# --------------------------------------------------------------------
ORG_JSONLD = '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "@id": "%(domain)s/#organization",
  "name": "Triton Wealth Management Corporation",
  "alternateName": "富瑞财富",
  "url": "%(domain)s/",
  "logo": "%(domain)s/assets/images/logo/triton-logo.png",
  "image": "%(domain)s/assets/images/hero-poster.jpg",
  "description": "加拿大温哥华华人理财顾问机构 — BC、安省、阿尔伯塔省持牌运营，提供保险、投资、退休规划、家族信托与财富传承的全方位定制化专业服务。",
  "telephone": "+1-778-837-6688",
  "email": "info@tritonwealth.ca",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "#1500 - 1200 W 73rd Avenue",
    "addressLocality": "Vancouver",
    "addressRegion": "BC",
    "postalCode": "V6P 6G5",
    "addressCountry": "CA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 49.2186,
    "longitude": -123.1257
  },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "17:00"
  }],
  "areaServed": [
    {"@type": "AdministrativeArea", "name": "British Columbia"},
    {"@type": "AdministrativeArea", "name": "Alberta"},
    {"@type": "AdministrativeArea", "name": "Ontario"}
  ],
  "knowsLanguage": ["zh-CN", "zh", "en"],
  "priceRange": "Free Initial Consultation",
  "founder": [
    {"@type": "Person", "name": "Jeffrey Yuan", "jobTitle": "President & Founding Partner"},
    {"@type": "Person", "name": "Claire Qiu", "jobTitle": "Director"}
  ],
  "contactPoint": [{
    "@type": "ContactPoint",
    "telephone": "+1-778-837-6688",
    "contactType": "customer service",
    "areaServed": ["CA"],
    "availableLanguage": ["Chinese", "English"]
  }, {
    "@type": "ContactPoint",
    "telephone": "+1-403-869-6886",
    "contactType": "customer service",
    "areaServed": ["CA-AB"],
    "availableLanguage": ["Chinese", "English"]
  }]
}
</script>''' % {"domain": DOMAIN}

# --------------------------------------------------------------------
# Build the full SEO meta block per page
# --------------------------------------------------------------------
def build_seo_block(cfg):
    title = cfg["title"]
    desc = cfg["description"]
    url = cfg["url"]
    keywords = cfg.get("keywords", "")
    og_type = cfg.get("og_type", "website")
    og_image = f"{DOMAIN}/assets/images/hero-poster.jpg"
    noindex = cfg.get("noindex", False)

    robots = '<meta name="robots" content="noindex, follow" />' if noindex else '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />'

    block = f'''<!-- SEO:start -->
  <title>{title}</title>
  <meta name="description" content="{desc}" />
  <meta name="keywords" content="{keywords}" />
  <meta name="author" content="Triton Wealth Management Corporation 富瑞财富" />
  <meta name="publisher" content="Triton Wealth Management Corporation" />
  {robots}
  <meta name="theme-color" content="#0B1E3F" />

  <!-- Geo / local SEO -->
  <meta name="geo.region" content="CA-BC" />
  <meta name="geo.placename" content="Vancouver" />
  <meta name="geo.position" content="49.2186;-123.1257" />
  <meta name="ICBM" content="49.2186, -123.1257" />

  <link rel="canonical" href="{url}" />

  <!-- Open Graph -->
  <meta property="og:locale" content="zh_CN" />
  <meta property="og:locale:alternate" content="en_CA" />
  <meta property="og:type" content="{og_type}" />
  <meta property="og:site_name" content="富瑞财富 Triton Wealth Management" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:url" content="{url}" />
  <meta property="og:image" content="{og_image}" />
  <meta property="og:image:width" content="1920" />
  <meta property="og:image:height" content="1080" />
  <meta property="og:image:alt" content="Triton Wealth Management 富瑞财富" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{desc}" />
  <meta name="twitter:image" content="{og_image}" />

  {ORG_JSONLD}
  <!-- SEO:end -->'''

    return block

# --------------------------------------------------------------------
# Replace SEO section in head
# --------------------------------------------------------------------
SEO_RE = re.compile(r'<!-- SEO:start -->.*?<!-- SEO:end -->', re.DOTALL)
# Old elements to strip (if present without SEO markers)
OLD_TAGS_RE = re.compile(
    r'\s*(?:<title>.*?</title>'
    r'|<meta\s+name="description"[^>]*/?>'
    r'|<meta\s+name="keywords"[^>]*/?>'
    r'|<meta\s+name="author"[^>]*/?>'
    r'|<meta\s+name="publisher"[^>]*/?>'
    r'|<meta\s+name="robots"[^>]*/?>'
    r'|<meta\s+name="theme-color"[^>]*/?>'
    r'|<meta\s+name="geo\.[^"]+"[^>]*/?>'
    r'|<meta\s+name="ICBM"[^>]*/?>'
    r'|<link\s+rel="canonical"[^>]*/?>'
    r'|<meta\s+property="og:[^"]+"[^>]*/?>'
    r'|<meta\s+name="twitter:[^"]+"[^>]*/?>'
    r'|<script\s+type="application/ld\+json">.*?</script>)',
    re.DOTALL
)

def update_file(path: Path, cfg: dict):
    html = path.read_text(encoding="utf-8")
    block = build_seo_block(cfg)

    if SEO_RE.search(html):
        html = SEO_RE.sub(block, html)
    else:
        # Strip any old loose SEO tags first
        html = OLD_TAGS_RE.sub('', html)
        # Insert block right after <meta name="viewport"> line, or after <meta charset>
        anchor = re.search(r'<meta\s+name="viewport"[^>]*/?>', html)
        if anchor:
            insert_at = anchor.end()
            html = html[:insert_at] + "\n\n  " + block + html[insert_at:]
        else:
            html = html.replace("<head>", "<head>\n  " + block, 1)

    path.write_text(html, encoding="utf-8")

# --------------------------------------------------------------------
# Run
# --------------------------------------------------------------------
def main():
    updated = []
    for flat, cfg in PAGES.items():
        # Flat version
        p = ROOT / flat
        if p.exists():
            update_file(p, cfg)
            updated.append(str(p.relative_to(ROOT)))
        # Pretty URL version
        slug = flat.replace(".html", "")
        if slug != "index":
            pretty = ROOT / slug / "index.html"
            if pretty.exists():
                update_file(pretty, cfg)
                updated.append(str(pretty.relative_to(ROOT)))
    print(f"Updated {len(updated)} files:")
    for u in updated:
        print(f"  ✓ {u}")

if __name__ == "__main__":
    main()
