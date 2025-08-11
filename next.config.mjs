import nextPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextPWA({
  dest: 'public',   // where service worker and manifest will be generated
  register: true,   // auto-register service worker
  skipWaiting: true // update SW immediately on new deploy
})(nextConfig);
