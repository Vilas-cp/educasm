const nextConfig = {
  output: "standalone", 
  distDir: "build", 
  experimental: {
    appDir: true, // Ensures API routes work properly
  },
};

export default nextConfig;
