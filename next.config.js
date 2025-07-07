/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Ignorer les warnings pour les dépendances optionnelles de ws
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'bufferutil': 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      });
    }

    // Réduire les warnings de dépendances critiques
    config.module = config.module || {};
    config.module.unknownContextCritical = false;

    return config;
  },
};

module.exports = nextConfig;
