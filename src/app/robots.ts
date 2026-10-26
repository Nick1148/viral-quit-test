import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // /api/og 와 /result/* 는 카카오톡·SNS 미리보기 수집기가 읽어야 하므로 막지 않는다.
    // (결과 페이지는 meta robots noindex 로 색인만 제외)
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/result', '/api/resign', '/api/ranking'] }],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
