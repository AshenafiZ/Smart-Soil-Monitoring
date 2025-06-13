import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    i18n: {
        locales: ["en", "am"],
        defaultLocale: "en",
      },
    images: {
     domains: ['res.cloudinary.com',], 
  },
};

export default nextConfig;

