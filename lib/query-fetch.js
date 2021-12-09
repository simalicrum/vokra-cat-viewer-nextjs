import { createQueryFetch } from "next-plugin-query-cache";

const { queryFetch, cache } = createQueryFetch({
  port: process.env.NEXT_QUERY_CACHE_PORT,
  fetch: fetch,
  shouldCache: (url, options) => {
    const method = options?.method?.toUpperCase() || "GET";
    return method === "GET" && typeof url === "string";
  },
  getProxyEnabled: async () =>
    (process.env.CI === "true" ||
      process.env.NEXT_PLUGIN_QUERY_CACHE_ACTIVE === "true") &&
    !!process.env.NEXT_QUERY_CACHE_PORT,
  getInMemoryCacheEnabled: async () => true,
  calculateCacheKey: (url, options) => url,
});

cache.clear();

export default queryFetch;
