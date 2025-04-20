/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any additional configuration here
  serverExternalPackages: ['mongoose'],
  // Use default build directory for Vercel compatibility
  // distDir: 'build-output',
  output: 'standalone',
  // Skip TypeScript checks during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Handle MongoDB driver to avoid warnings
    return {
      ...config,
      experiments: {
        ...config.experiments,
        topLevelAwait: true,
      },
    };
  }
};

module.exports = nextConfig; 