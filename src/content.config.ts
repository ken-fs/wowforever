import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(165),
    /** 页面顶部那行"关键数字"，answer-first */
    facts: z.array(z.object({ k: z.string(), v: z.string() })).default([]),
    updated: z.coerce.date(),
    build: z.string().optional(),
    sources: z.array(z.object({ label: z.string(), url: z.string().optional() })).default([]),
  }),
});

export const collections = { guides };
