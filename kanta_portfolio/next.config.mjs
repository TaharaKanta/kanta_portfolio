/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'kanta_portfolio';

const nextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repoName}` : '',
  },
  // i18n: {
  //   locales: ['en', 'ja'],
  //   defaultLocale: 'ja',
  // },
};

export default nextConfig;
