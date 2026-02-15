/**
 * Server-side dynamic sitemap for user-generated projects
 * Generates sitemap entries for all published projects
 */

import { getServerSideSitemap } from 'next-sitemap';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  // Fetch all published projects
  const { data: projects } = await supabase
    .from('projects')
    .select('subdomain, updated_at, custom_domain')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  const siteUrl = process.env.SITE_URL || 'https://svarnex.app';

  const fields = projects?.map((project: any) => ({
    loc: project.custom_domain 
      ? `https://${project.custom_domain}`
      : `https://${project.subdomain}.${siteUrl.replace('https://', '')}`,
    lastmod: project.updated_at || new Date().toISOString(),
    changefreq: 'weekly' as const,
    priority: 0.8,
  })) || [];

  return getServerSideSitemap(fields);
}
