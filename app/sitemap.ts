// app/sitemap.ts
import type { MetadataRoute } from "next";
import { supabasePublic } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const { data: posts } = await supabasePublic
    .from("blog_posts")
    .select("slug, updated_at, published_at")
    .eq("is_published", true);

  const { data: categories } = await supabasePublic
    .from("blog_categories")
    .select("slug");

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at
      ? new Date(post.updated_at)
      : new Date(post.published_at ?? Date.now()),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map(
    (cat) => ({
      url: `${siteUrl}/blog/category/${cat.slug}`,
      changeFrequency: "weekly",
      priority: 0.4,
    }),
  );

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}
