#!/usr/bin/env python3
"""Add BreadcrumbList JSON-LD to inner pages + ItemList of services to /services/."""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
DOMAIN = "https://www.tritonwealth.ca"

BREADCRUMB_PAGES = {
    "about.html":    ("关于我们", "/about/"),
    "services.html": ("服务范围", "/services/"),
    "partners.html": ("合作伙伴", "/partners/"),
    "workshops.html":("富瑞讲堂", "/workshops/"),
    "contact.html":  ("联系我们", "/contact/"),
}

def breadcrumb_ld(name, url):
    return f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {{"@type": "ListItem", "position": 1, "name": "主页", "item": "{DOMAIN}/"}},
    {{"@type": "ListItem", "position": 2, "name": "{name}", "item": "{DOMAIN}{url}"}}
  ]
}}
</script>'''

SERVICES_LD = f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "富瑞财富八大核心服务",
  "itemListElement": [
    {{"@type": "Service", "position": 1, "name": "家庭保障规划", "url": "{DOMAIN}/services/#s1", "provider": {{"@id": "{DOMAIN}/#organization"}}, "description": "以家庭经济支柱为核心，合理配置人寿保险保额，守护至亲，规避债务与税务风险。"}},
    {{"@type": "Service", "position": 2, "name": "个人投资规划", "url": "{DOMAIN}/services/#s2", "provider": {{"@id": "{DOMAIN}/#organization"}}, "description": "TFSA、RRSP、RESP 等注册账户与非注册账户的全盘配置，长线增值与税务筹划并重。"}},
    {{"@type": "Service", "position": 3, "name": "公司保单规划", "url": "{DOMAIN}/services/#s3", "provider": {{"@id": "{DOMAIN}/#organization"}}, "description": "稳定增值、延税优税、放大传承 — 企业主优化公司净值与税务的核心工具。"}},
    {{"@type": "Service", "position": 4, "name": "投资贷款计划", "url": "{DOMAIN}/services/#s4", "provider": {{"@id": "{DOMAIN}/#organization"}}, "description": "合理利用银行杠杆，加速财富增长，扩大投资组合，享受可扣除利息费等多重优势。"}},
    {{"@type": "Service", "position": 5, "name": "重疾保障计划", "url": "{DOMAIN}/services/#s5", "provider": {{"@id": "{DOMAIN}/#organization"}}, "description": "一次性赔付、不限用途，弥补公共医疗外的真空地带，减轻康复期家庭财务压力。"}},
    {{"@type": "Service", "position": 6, "name": "儿童财务规划", "url": "{DOMAIN}/services/#s6", "provider": {{"@id": "{DOMAIN}/#organization"}}, "description": "分红式儿童保险，惠及祖孙三代，从教育到创业、婚嫁、养老的百年长情陪伴。"}},
    {{"@type": "Service", "position": 7, "name": "保单融资规划 IFA", "url": "{DOMAIN}/services/#s7", "provider": {{"@id": "{DOMAIN}/#organization"}}, "description": "Immediate Finance Arrangement —「四两拨千斤」实现财富双倍增值的高净值方案。"}},
    {{"@type": "Service", "position": 8, "name": "退休养老规划 IRP", "url": "{DOMAIN}/services/#s8", "provider": {{"@id": "{DOMAIN}/#organization"}}, "description": "以分红式退休型保险为依托建立保险退休计划 IRP，让退休生活从容而丰盈。"}}
  ]
}}
</script>'''

BREADCRUMB_MARK = "<!-- SEO:breadcrumb -->"
SERVICES_MARK = "<!-- SEO:services-list -->"

def inject(path: Path, ld: str, marker: str):
    html = path.read_text(encoding="utf-8")
    block = f"{marker}\n  {ld}\n  <!-- /SEO -->"
    # Remove existing
    html = re.sub(re.escape(marker) + r'.*?<!-- /SEO -->', '', html, flags=re.DOTALL)
    # Insert before </head>
    html = html.replace("</head>", f"  {block}\n</head>", 1)
    path.write_text(html, encoding="utf-8")

count = 0
for flat, (name, url) in BREADCRUMB_PAGES.items():
    ld = breadcrumb_ld(name, url)
    for p in [ROOT / flat, ROOT / flat.replace(".html", "") / "index.html"]:
        if p.exists():
            inject(p, ld, BREADCRUMB_MARK)
            count += 1
            print(f"  ✓ breadcrumb -> {p.relative_to(ROOT)}")

# Services list on services pages
for p in [ROOT / "services.html", ROOT / "services" / "index.html"]:
    if p.exists():
        inject(p, SERVICES_LD, SERVICES_MARK)
        count += 1
        print(f"  ✓ services list -> {p.relative_to(ROOT)}")

print(f"\nTotal injections: {count}")
