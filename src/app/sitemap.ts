import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/test`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/resign`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/ranking`, changeFrequency: 'daily', priority: 0.7 },
  ];
}
