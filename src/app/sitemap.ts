import { MetadataRoute } from 'next';

export default function siteamp(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://foti-box.com',
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: 'https://foti-box.com/upload',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];
}
