// GitHub Pages는 정적 파일만 제공하므로 Next.js를 정적 HTML/CSS/JS로 내보낸다(output: "export").
// 사이트가 https://<user>.github.io/<repo>/ 하위 경로에서 열리므로 basePath에 repo 이름을 넣는다.
const repo = "stocktutor";
const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  basePath: isProd ? `/${repo}` : "",
  trailingSlash: true,
};

export default nextConfig;
