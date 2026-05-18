// =====================================================
// Triton Wealth - Legacy URL Redirects
// Cloudflare Snippet — runs at the edge on every request
// Configure trigger filter: (matches all subsequent rules below)
// =====================================================

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    // Map of old paths → new paths (301 permanent redirects)
    const redirects = {
      // Old flat .html files → pretty URL directories
      "/about.html":              "/about/",
      "/services.html":           "/services/",
      "/partners.html":           "/partners/",
      "/workshops.html":          "/workshops/",
      "/contact.html":            "/contact/",
      "/legal-disclaimers.html":  "/legal-disclaimers/",
      "/terms.html":              "/terms/",
      "/index.html":              "/",

      // Wix-era misspelled & legacy URLs
      "/parners":                 "/partners/",
      "/parners.html":            "/partners/",
      "/copy-of-privary-policy":  "/legal-disclaimers/",
      "/copy-of-legal-disclaimers": "/terms/",
    };

    if (redirects[path]) {
      const target = new URL(redirects[path], url);
      // Preserve query string + hash
      target.search = url.search;
      target.hash = url.hash;
      return Response.redirect(target.toString(), 301);
    }

    // Not a legacy URL — let it pass through to origin
    return fetch(request);
  },
};
