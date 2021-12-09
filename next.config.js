const createNextPluginQueryCache = require("next-plugin-query-cache/config");
const withNextPluginQueryCache = createNextPluginQueryCache({
  calculateCacheKey: (url, options) => url,
});

module.exports = withNextPluginQueryCache({
  images: {
    domains: ["www.shelterluv.com"],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
});
