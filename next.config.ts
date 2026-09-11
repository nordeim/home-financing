import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/loans/fha", destination: "/modular-home-financing/loan-options/fha", permanent: true },
      { source: "/loans/va", destination: "/modular-home-financing/loan-options/va", permanent: true },
      { source: "/loans/usda", destination: "/modular-home-financing/loan-options/usda", permanent: true },
      { source: "/loans/construction", destination: "/modular-home-financing/loan-options/construction-loan", permanent: true },
      { source: "/manufacturers", destination: "/modular-home-financing/manufacturers", permanent: true },
      { source: "/manufacturers/:slug", destination: "/modular-home-financing/manufacturers/:slug", permanent: true },
      { source: "/states/:state", destination: "/modular-home-financing/states/:state", permanent: true },
      { source: "/get-started-v2", destination: "/get-started", permanent: false },
      { source: "/playbook", destination: "/learn", permanent: false },
    ];
  },
};

export default nextConfig;
