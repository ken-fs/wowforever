import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://wowforever.one",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // node:sqlite 只在构建期用（读 data/wow-forever.db），别让 Vite 打包它
    ssr: { external: ["node:sqlite"] },
  },
  // 目录是纯数据页，构建设成静态 HTML
  build: { format: "directory" },
});
