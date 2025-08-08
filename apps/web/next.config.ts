import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-0d475d35bd594b8180c8ab8c0addd19a.r2.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img1.ak.crunchyroll.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.kitsu.app",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "files.catbox.moe",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;