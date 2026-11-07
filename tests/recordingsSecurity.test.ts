import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVideoSource } from '../lib/video/parseVideoSource.ts';
import { recordingSchema, updateAccessSchema } from '../lib/validations/recording.ts';

test('Security 1: Rejection of javascript: XSS payload in video URL', () => {
  const result = parseVideoSource('javascript:/*--></title></style></textarea></script><svg/onload=alert(1)>');
  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error, /Insecure URL scheme detected/i);
  }
});

test('Security 2: Rejection of data: URI payload', () => {
  const result = parseVideoSource('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==');
  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error, /Insecure URL scheme detected/i);
  }
});

test('Security 3: Rejection of unencrypted HTTP URL', () => {
  const result = parseVideoSource('http://kfa-cdn.example.com/recording.mp4');
  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error, /Insecure HTTP URL/i);
  }
});

test('Security 4: Rejection of untrusted third-party iframe domain', () => {
  const iframeSnippet = '<iframe src="https://attacker-domain.evil/embed/123" width="500"></iframe>';
  const result = parseVideoSource(iframeSnippet);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error, /not on the list of approved video embed sources/i);
  }
});

test('Security 5: Raw HTML tags stripped, extracting strictly the safe src attribute', () => {
  const iframeWithBadAttributes =
    '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" onload="alert(\'pwned\')" onerror="alert(1)"></iframe>';
  const result = parseVideoSource(iframeWithBadAttributes);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.source_type, 'youtube');
    assert.equal(result.video_id, 'dQw4w9WgXcQ');
    assert.equal(
      result.embed_src,
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
    );
  }
});

test('Security 6: Zod validation schema strictly validates UUIDs and required recording parameters', () => {
  const validData = {
    title: 'Saree Blouse Armhole Masterclass',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    student_ids: ['a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222'],
    is_published: true,
    sort_order: 1,
  };

  const parsed = recordingSchema.safeParse(validData);
  assert.equal(parsed.success, true);

  // Invalid student ID UUID must fail
  const invalidStudentData = {
    ...validData,
    student_ids: ['invalid-not-a-uuid'],
  };
  const invalidParse = recordingSchema.safeParse(invalidStudentData);
  assert.equal(invalidParse.success, false);
});

test('Security 7: Access Expiry simulation logic', () => {
  const pastDate = new Date(Date.now() - 3600000).toISOString();
  const futureDate = new Date(Date.now() + 3600000).toISOString();

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
  };

  assert.equal(isExpired(null), false, 'Null expiry should remain active');
  assert.equal(isExpired(futureDate), false, 'Future date should remain active');
  assert.equal(isExpired(pastDate), true, 'Past expiry date must be expired');
});

test('Security 8: Update Access Schema validates recording UUID and student UUIDs', () => {
  const updatePayload = {
    recording_id: 'e1111111-1111-1111-1111-111111111111',
    student_ids: ['c1111111-1111-1111-1111-111111111111'],
    expires_at: '2026-12-31',
  };

  const validated = updateAccessSchema.safeParse(updatePayload);
  assert.equal(validated.success, true);
});
