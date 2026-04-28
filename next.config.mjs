/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "hoirqrkdgbmvpwutwuwj.supabase.co" },
      { protocol: "https", hostname: "files.chroniclehq.com" }
    ]
  },
  experimental: {
    serverActions: { bodySizeLimit: "4mb" }
  }
};
export default nextConfig;
