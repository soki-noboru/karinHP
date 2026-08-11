/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // microCMSの画像配信ドメイン（アップロードした画像はここから配信されます）
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
    ],
  },
};

module.exports = nextConfig;
