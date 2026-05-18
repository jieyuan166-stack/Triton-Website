#!/usr/bin/env python3
"""Add FAQ Schema (contact pages) and Person Schema (about pages)."""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
DOMAIN = "https://www.tritonwealth.ca"

# --- FAQ Schema (from contact.html FAQ section) ---
FAQ = [
    ("初次咨询需要收费吗？",
     "不需要。我们提供免费的初步咨询，帮助您梳理财富现状与目标，再决定是否进一步合作。"),
    ("咨询时需要准备哪些资料？",
     "建议准备：现有保单概览、家庭收支大致情况、资产负债清单、退休或传承的初步想法。无需精确数字，初步沟通时大致区间即可。"),
    ("可以远程视频咨询吗？",
     "可以。我们支持 Zoom、微信等视频方式，方便不在温哥华或卡尔加里的客户进行远程沟通。"),
    ("你们的服务覆盖哪些省份？",
     "我们在 BC 省、安省（Ontario）以及阿尔伯塔省（Alberta）持牌运营，可为这三省的居民提供合规的保险与投资咨询服务。"),
]

def faq_ld():
    items = []
    for q, a in FAQ:
        items.append(f'''    {{
      "@type": "Question",
      "name": {q!r},
      "acceptedAnswer": {{"@type": "Answer", "text": {a!r}}}
    }}''')
    return '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
''' + ',\n'.join(items) + '''
  ]
}
</script>'''

# --- Person Schema (founders) ---
def person_ld():
    return f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": "Person",
      "@id": "{DOMAIN}/about/#jeffrey-yuan",
      "name": "Jeffrey Yuan",
      "givenName": "Jeffrey",
      "familyName": "Yuan",
      "jobTitle": "President & Founding Partner",
      "image": "{DOMAIN}/assets/images/founders/jeffrey-yuan.webp",
      "worksFor": {{"@id": "{DOMAIN}/#organization"}},
      "knowsLanguage": ["zh-CN", "en"],
      "hasCredential": [
        {{"@type": "EducationalOccupationalCredential", "name": "Million Dollar Round Table - Top of the Table (TOT)", "credentialCategory": "Professional Designation"}},
        {{"@type": "EducationalOccupationalCredential", "name": "Registered Retirement Consultant (RRC)", "credentialCategory": "Professional Designation"}}
      ],
      "knowsAbout": ["Life Insurance", "Investment Planning", "Retirement Planning", "Estate Planning", "Wealth Management", "保险规划", "退休规划", "财富传承"]
    }},
    {{
      "@type": "Person",
      "@id": "{DOMAIN}/about/#claire-qiu",
      "name": "Claire Qiu",
      "givenName": "Claire",
      "familyName": "Qiu",
      "jobTitle": "Director",
      "image": "{DOMAIN}/assets/images/founders/claire-qiu.webp",
      "worksFor": {{"@id": "{DOMAIN}/#organization"}},
      "knowsLanguage": ["zh-CN", "en"],
      "hasCredential": [
        {{"@type": "EducationalOccupationalCredential", "name": "Million Dollar Round Table - Court of the Table (COT)", "credentialCategory": "Professional Designation"}},
        {{"@type": "EducationalOccupationalCredential", "name": "LLQP Training Instructor", "credentialCategory": "Professional Certification"}}
      ],
      "knowsAbout": ["Life Insurance", "Investment Planning", "LLQP Training", "Financial Education", "保险规划", "投资规划"]
    }}
  ]
}}
</script>'''

# --- Inject helper ---
def inject(path: Path, marker: str, ld: str):
    html = path.read_text(encoding="utf-8")
    block = f"{marker}\n  {ld}\n  <!-- /SEO -->"
    html = re.sub(re.escape(marker) + r'.*?<!-- /SEO -->', '', html, flags=re.DOTALL)
    html = html.replace("</head>", f"  {block}\n</head>", 1)
    path.write_text(html, encoding="utf-8")
    print(f"  ✓ {path.relative_to(ROOT)}")

# FAQ → contact pages
for p in [ROOT/"contact.html", ROOT/"contact"/"index.html"]:
    if p.exists():
        inject(p, "<!-- SEO:faq -->", faq_ld())

# Person → about pages
for p in [ROOT/"about.html", ROOT/"about"/"index.html"]:
    if p.exists():
        inject(p, "<!-- SEO:persons -->", person_ld())

print("Done.")
