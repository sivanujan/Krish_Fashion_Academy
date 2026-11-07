import { isAllowedEmbedHost } from './allowedHosts.ts';
import type { VideoSourceType } from '../../types/database.ts';

export interface ParsedVideoResult {
  success: true;
  source_type: VideoSourceType;
  video_id: string | null;
  embed_src: string | null;
  thumbnail_url: string | null;
  extra_note?: string;
  normalized_url: string;
}

export interface ParseVideoError {
  success: false;
  error: string;
}

export type ParseVideoOutput = ParsedVideoResult | ParseVideoError;

/**
 * Parses time string (e.g. "1m30s", "90", "90s", "1h20m") to total seconds.
 */
function parseTimeStringToSeconds(timeStr: string): number | null {
  if (!timeStr) return null;
  const raw = timeStr.trim();
  if (/^\d+$/.test(raw)) {
    return parseInt(raw, 10);
  }
  let total = 0;
  let matched = false;
  const hoursMatch = raw.match(/(\d+)h/i);
  if (hoursMatch) {
    total += parseInt(hoursMatch[1], 10) * 3600;
    matched = true;
  }
  const minsMatch = raw.match(/(\d+)m/i);
  if (minsMatch) {
    total += parseInt(minsMatch[1], 10) * 60;
    matched = true;
  }
  const secsMatch = raw.match(/(\d+)s/i);
  if (secsMatch) {
    total += parseInt(secsMatch[1], 10);
    matched = true;
  }
  return matched ? total : null;
}

/**
 * Extracts the src attribute from an iframe code snippet if pasted.
 */
function extractSrcFromIframe(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.toLowerCase().includes('<iframe')) {
    return trimmed;
  }

  // Regex handles src="...", src='...', and src=...
  const match = trimmed.match(/src\s*=\s*(["'])(.*?)\1/i) || trimmed.match(/src\s*=\s*([^\s>]+)/i);
  if (match && match[2]) {
    return match[2].trim();
  }
  if (match && match[1] && !match[2]) {
    return match[1].trim();
  }
  return trimmed;
}

/**
 * Core video URL parser and validator.
 * Accepts raw pasted URL or complete <iframe> HTML embed code.
 */
export function parseVideoSource(rawInput: string): ParseVideoOutput {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    return { success: false, error: 'Please enter a video URL or iframe embed code.' };
  }

  const rawExtracted = extractSrcFromIframe(rawInput.trim());

  // Security check: Must not contain javascript: or data: schemes
  const lower = rawExtracted.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return {
      success: false,
      error: 'Insecure URL scheme detected. Only secure HTTPS URLs are permitted.'
    };
  }

  if (lower.startsWith('http://')) {
    return {
      success: false,
      error: 'Insecure HTTP URL. Please provide an HTTPS URL for secure student playback.'
    };
  }

  // Resolve URL object
  let urlObj: URL;
  try {
    // If protocol was missing, e.g. //youtube.com/..., prepend https:
    const toParse = rawExtracted.startsWith('//') ? `https:${rawExtracted}` : rawExtracted;
    urlObj = new URL(toParse);
  } catch {
    return {
      success: false,
      error: 'Invalid URL format. Please provide a valid HTTPS link or iframe code.'
    };
  }

  if (urlObj.protocol !== 'https:') {
    return {
      success: false,
      error: 'Only HTTPS URLs are supported.'
    };
  }

  const host = urlObj.hostname.toLowerCase();
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // 1. DIRECT VIDEO FILES (.mp4, .webm, .m3u8)
  const cleanPath = pathname.toLowerCase();
  if (cleanPath.endsWith('.mp4') || cleanPath.endsWith('.webm')) {
    const filename = pathname.split('/').filter(Boolean).pop() || null;
    return {
      success: true,
      source_type: 'mp4',
      video_id: filename,
      embed_src: urlObj.toString(),
      thumbnail_url: null,
      normalized_url: urlObj.toString()
    };
  }

  if (cleanPath.endsWith('.m3u8')) {
    const streamId = pathname.split('/').filter(Boolean).pop() || null;
    return {
      success: true,
      source_type: 'hls',
      video_id: streamId,
      embed_src: urlObj.toString(),
      thumbnail_url: null,
      normalized_url: urlObj.toString()
    };
  }

  // 2. YOUTUBE
  // Domains: youtube.com, www.youtube.com, m.youtube.com, youtu.be, youtube-nocookie.com
  if (
    host === 'youtube.com' ||
    host === 'www.youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'youtu.be' ||
    host === 'www.youtube-nocookie.com' ||
    host === 'youtube-nocookie.com'
  ) {
    let videoId: string | null = null;
    let timeParam: string | null = searchParams.get('t') || searchParams.get('start');

    if (host === 'youtu.be') {
      videoId = pathname.replace(/^\/+/, '').split('/')[0] || null;
    } else if (pathname.startsWith('/shorts/')) {
      videoId = pathname.replace('/shorts/', '').split('/')[0] || null;
    } else if (pathname.startsWith('/embed/')) {
      videoId = pathname.replace('/embed/', '').split('/')[0] || null;
    } else if (pathname.startsWith('/live/')) {
      videoId = pathname.replace('/live/', '').split('/')[0] || null;
    } else if (pathname.startsWith('/watch')) {
      videoId = searchParams.get('v');
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
      return {
        success: false,
        error: 'Could not detect a valid YouTube video ID from the provided URL.'
      };
    }

    let startSeconds: number | null = null;
    if (timeParam) {
      startSeconds = parseTimeStringToSeconds(timeParam);
    }

    const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
    embedUrl.searchParams.set('rel', '0');
    embedUrl.searchParams.set('modestbranding', '1');
    if (startSeconds !== null && startSeconds > 0) {
      embedUrl.searchParams.set('start', startSeconds.toString());
    }

    return {
      success: true,
      source_type: 'youtube',
      video_id: videoId,
      embed_src: embedUrl.toString(),
      thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      normalized_url: `https://www.youtube.com/watch?v=${videoId}`
    };
  }

  // 3. VIMEO
  // Domains: vimeo.com, player.vimeo.com
  if (host === 'vimeo.com' || host === 'www.vimeo.com' || host === 'player.vimeo.com') {
    let videoId: string | null = null;
    let hash: string | null = searchParams.get('h');

    if (host === 'player.vimeo.com') {
      const match = pathname.match(/\/video\/(\d+)/);
      if (match) videoId = match[1];
    } else {
      // vimeo.com/{id} or vimeo.com/{id}/{hash}
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length >= 1 && /^\d+$/.test(parts[0])) {
        videoId = parts[0];
        if (parts.length >= 2 && !hash) {
          hash = parts[1];
        }
      }
    }

    if (!videoId) {
      return {
        success: false,
        error: 'Could not detect a valid Vimeo video ID from the provided link.'
      };
    }

    let embedSrc = `https://player.vimeo.com/video/${videoId}`;
    if (hash) {
      embedSrc += `?h=${hash}`;
    }

    return {
      success: true,
      source_type: 'vimeo',
      video_id: videoId,
      embed_src: embedSrc,
      thumbnail_url: null,
      normalized_url: hash ? `https://vimeo.com/${videoId}/${hash}` : `https://vimeo.com/${videoId}`
    };
  }

  // 4. GOOGLE DRIVE
  if (host === 'drive.google.com' || host === 'docs.google.com') {
    let driveId: string | null = null;

    const fileMatch = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      driveId = fileMatch[1];
    } else if (searchParams.get('id')) {
      driveId = searchParams.get('id');
    }

    if (!driveId) {
      return {
        success: false,
        error: 'Could not detect a valid Google Drive file ID.'
      };
    }

    return {
      success: true,
      source_type: 'google_drive',
      video_id: driveId,
      embed_src: `https://drive.google.com/file/d/${driveId}/preview`,
      thumbnail_url: null,
      normalized_url: `https://drive.google.com/file/d/${driveId}/view`
    };
  }

  // 5. BUNNY STREAM
  // Patterns: iframe.mediadelivery.net/embed/{libraryId}/{videoId} or /play/{libraryId}/{videoId}
  if (host === 'iframe.mediadelivery.net') {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 3 && (parts[0] === 'embed' || parts[0] === 'play')) {
      const libraryId = parts[1];
      const videoId = parts[2];
      return {
        success: true,
        source_type: 'bunny',
        video_id: `${libraryId}/${videoId}`,
        embed_src: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
        thumbnail_url: `https://vz-${libraryId}.b-cdn.net/${videoId}/thumbnail.jpg`,
        normalized_url: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`
      };
    }
  }

  // 6. ZOOM RECORDING LINKS
  if (host === 'zoom.us' || host.endsWith('.zoom.us')) {
    if (pathname.includes('/rec/') || pathname.includes('/recording/')) {
      const shareToken = pathname.split('/').filter(Boolean).pop() || null;
      return {
        success: true,
        source_type: 'zoom_link',
        video_id: shareToken,
        embed_src: null, // Zoom prohibits iframe embedding via X-Frame-Options
        thumbnail_url: null,
        extra_note:
          'Zoom cloud recordings do not permit iframe embedding. Students will receive an "Open Recording" button to view it securely.',
        normalized_url: urlObj.toString()
      };
    }
  }

  // 7. OTHER ALLOWLISTED EMBED HOSTS
  if (isAllowedEmbedHost(host)) {
    return {
      success: true,
      source_type: 'other_embed',
      video_id: null,
      embed_src: urlObj.toString(),
      thumbnail_url: null,
      normalized_url: urlObj.toString()
    };
  }

  // Unrecognized host
  return {
    success: false,
    error: `The host "${host}" is not on the list of approved video embed sources. Supported: YouTube, Vimeo, Google Drive, Bunny Stream, Zoom recordings, direct MP4/HLS, Loom, Wistia, and Canva.`
  };
}
