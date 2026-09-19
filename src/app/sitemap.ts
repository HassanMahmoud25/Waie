import type { MetadataRoute } from "next";
import { contentRepository } from "@/lib/repositories";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [episodes, series, topics, collections] = await Promise.all([
    contentRepository.listEpisodes(),
    contentRepository.listSeries(),
    contentRepository.listTopics(),
    contentRepository.listCollections(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/series",
    "/topics",
    "/hosts",
    "/collections",
    "/search",
    "/library",
  ].map((path) => ({ url: `${siteConfig.url}${path}`, lastModified: new Date() }));

  const episodeRoutes: MetadataRoute.Sitemap = episodes.map((episode) => ({
    url: `${siteConfig.url}/episodes/${episode.slug}`,
    lastModified: episode.publishedAt,
  }));

  const seriesRoutes: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${siteConfig.url}/series/${s.slug}`,
    lastModified: new Date(),
  }));

  const topicRoutes: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${siteConfig.url}/topics/${topic.slug}`,
    lastModified: new Date(),
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `${siteConfig.url}/collections/${collection.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...episodeRoutes, ...seriesRoutes, ...topicRoutes, ...collectionRoutes];
}
