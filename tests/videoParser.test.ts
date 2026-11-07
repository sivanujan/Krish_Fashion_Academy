import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVideoSource } from '../lib/video/parseVideoSource.ts';

test('1. YouTube standard watch URL', () => {
  const result = parseVideoSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'youtube');
    assert.equal(result.video_id, 'dQw4w9WgXcQ');
    assert.equal(
      result.embed_src,
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
    );
    assert.equal(result.thumbnail_url, 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  }
});

test('2. YouTube short link (youtu.be)', () => {
  const result = parseVideoSource('https://youtu.be/dQw4w9WgXcQ');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'youtube');
    assert.equal(result.video_id, 'dQw4w9WgXcQ');
  }
});

test('3. YouTube shorts URL', () => {
  const result = parseVideoSource('https://www.youtube.com/shorts/dQw4w9WgXcQ');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'youtube');
    assert.equal(result.video_id, 'dQw4w9WgXcQ');
  }
});

test('4. YouTube live URL', () => {
  const result = parseVideoSource('https://www.youtube.com/live/dQw4w9WgXcQ');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'youtube');
    assert.equal(result.video_id, 'dQw4w9WgXcQ');
  }
});

test('5. YouTube embed URL', () => {
  const result = parseVideoSource('https://www.youtube.com/embed/dQw4w9WgXcQ');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'youtube');
    assert.equal(result.video_id, 'dQw4w9WgXcQ');
  }
});

test('6. YouTube URL with timestamp parameter', () => {
  const result = parseVideoSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1m30s');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'youtube');
    assert.ok(result.embed_src?.includes('start=90'));
  }
});

test('7. YouTube URL with extra tracking parameters', () => {
  const result = parseVideoSource('https://youtu.be/dQw4w9WgXcQ?si=abc123xyz&list=PL123');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'youtube');
    assert.equal(result.video_id, 'dQw4w9WgXcQ');
  }
});

test('8. YouTube raw iframe embed code extraction', () => {
  const iframe = '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allowfullscreen></iframe>';
  const result = parseVideoSource(iframe);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'youtube');
    assert.equal(result.video_id, 'dQw4w9WgXcQ');
  }
});

test('9. Vimeo standard URL', () => {
  const result = parseVideoSource('https://vimeo.com/76979871');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'vimeo');
    assert.equal(result.video_id, '76979871');
    assert.equal(result.embed_src, 'https://player.vimeo.com/video/76979871');
  }
});

test('10. Vimeo unlisted URL with privacy hash', () => {
  const result = parseVideoSource('https://vimeo.com/76979871/abcdef1234');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'vimeo');
    assert.equal(result.video_id, '76979871');
    assert.equal(result.embed_src, 'https://player.vimeo.com/video/76979871?h=abcdef1234');
  }
});

test('11. Vimeo player iframe URL', () => {
  const result = parseVideoSource('https://player.vimeo.com/video/76979871?h=abcdef1234');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'vimeo');
    assert.equal(result.video_id, '76979871');
    assert.equal(result.embed_src, 'https://player.vimeo.com/video/76979871?h=abcdef1234');
  }
});

test('12. Google Drive /file/d/ view URL', () => {
  const result = parseVideoSource('https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'google_drive');
    assert.equal(result.video_id, '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs');
    assert.equal(result.embed_src, 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview');
  }
});

test('13. Google Drive /open?id= URL', () => {
  const result = parseVideoSource('https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'google_drive');
    assert.equal(result.video_id, '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs');
    assert.equal(result.embed_src, 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview');
  }
});

test('14. Bunny Stream embed URL', () => {
  const result = parseVideoSource('https://iframe.mediadelivery.net/embed/12345/abcdef-1234-5678-90ab');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'bunny');
    assert.equal(result.video_id, '12345/abcdef-1234-5678-90ab');
    assert.equal(result.embed_src, 'https://iframe.mediadelivery.net/embed/12345/abcdef-1234-5678-90ab');
    assert.equal(result.thumbnail_url, 'https://vz-12345.b-cdn.net/abcdef-1234-5678-90ab/thumbnail.jpg');
  }
});

test('15. Direct MP4 video URL', () => {
  const result = parseVideoSource('https://kfa-cdn.example.com/recordings/cutting-lesson.mp4');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'mp4');
    assert.equal(result.video_id, 'cutting-lesson.mp4');
    assert.equal(result.embed_src, 'https://kfa-cdn.example.com/recordings/cutting-lesson.mp4');
  }
});

test('16. Direct WebM video URL', () => {
  const result = parseVideoSource('https://kfa-cdn.example.com/recordings/pattern-making.webm');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'mp4');
    assert.equal(result.video_id, 'pattern-making.webm');
  }
});

test('17. Direct HLS streaming playlist URL (.m3u8)', () => {
  const result = parseVideoSource('https://kfa-cdn.example.com/streams/live-session.m3u8');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'hls');
    assert.equal(result.video_id, 'live-session.m3u8');
    assert.equal(result.embed_src, 'https://kfa-cdn.example.com/streams/live-session.m3u8');
  }
});

test('18. Zoom cloud recording link', () => {
  const result = parseVideoSource('https://us02web.zoom.us/rec/share/AbC123XyZ456');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'zoom_link');
    assert.equal(result.embed_src, null);
    assert.ok(result.extra_note?.includes('Zoom cloud recordings'));
  }
});

test('19. Allowlisted provider Loom', () => {
  const result = parseVideoSource('https://www.loom.com/share/1234567890abcdef');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'other_embed');
    assert.equal(result.embed_src, 'https://www.loom.com/share/1234567890abcdef');
  }
});

test('20. Allowlisted provider Wistia', () => {
  const result = parseVideoSource('https://fast.wistia.net/embed/iframe/abcdef123');
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'other_embed');
  }
});

test('21. Security: Reject javascript: URI scheme', () => {
  const result = parseVideoSource('javascript:alert(1)');
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.includes('Insecure URL scheme'));
  }
});

test('22. Security: Reject data: URI scheme', () => {
  const result = parseVideoSource('data:text/html,<script>alert(1)</script>');
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.includes('Insecure URL scheme'));
  }
});

test('23. Security: Reject unencrypted HTTP URL', () => {
  const result = parseVideoSource('http://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.includes('Insecure HTTP URL'));
  }
});

test('24. Security: Reject unapproved third-party host', () => {
  const result = parseVideoSource('https://untrusted-video-host.example.com/watch?v=123');
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.includes('not on the list of approved video embed sources'));
  }
});

test('25. Validation: Reject empty or blank input', () => {
  const result = parseVideoSource('   ');
  assert.equal(result.success, false);
});
