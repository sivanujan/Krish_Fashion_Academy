/**
 * Allowlist of trusted external hostnames permitted for generic iframe embeds (`other_embed`).
 * Only secure HTTPS origins from approved video/hosting services are accepted.
 */
export const ALLOWED_EMBED_HOSTS: readonly string[] = [
  'loom.com',
  'www.loom.com',
  'fast.wistia.net',
  'fast.wistia.com',
  'wistia.net',
  'wistia.com',
  'sproutvideo.com',
  'videos.sproutvideo.com',
  'play.vidyard.com',
  'share.vidyard.com',
  'vidyard.com',
  'microsoftstream.com',
  'streamable.com',
  'iframe.videodelivery.net',
  'videodelivery.net',
  'dailymotion.com',
  'geo.dailymotion.com',
  'canva.com',
  'www.canva.com'
];

/**
 * Checks if a hostname matches any allowed host or its subdomain.
 */
export function isAllowedEmbedHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase().trim();
  return ALLOWED_EMBED_HOSTS.some(
    (allowed) => normalized === allowed || normalized.endsWith('.' + allowed)
  );
}
