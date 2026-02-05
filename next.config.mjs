import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // disable in dev
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Cache the homepage
    {
      urlPattern: /^\/$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "home-page",
        expiration: { maxEntries: 1, maxAgeSeconds: 24 * 60 * 60 }, // 1 day
      },
    },

    // Cache images
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images-cache",
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // Cache Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^\/to-do\/?.*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "todo-pages",
        expiration: { maxEntries: 10, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
