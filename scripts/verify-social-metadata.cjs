const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const output = path.join(projectRoot, 'dist/myapps/browser');
const pageUrl = 'https://app.rizauddin.com/luluske';
const imageUrl = 'https://app.rizauddin.com/assets/luluske-og.png';

function verifyMetadata(filename) {
  const html = fs.readFileSync(filename, 'utf8');
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  assert.ok(head, `${filename}: missing initial HTML head`);
  const tags = new Map();
  for (const [, attributes] of head.matchAll(/<meta\s+([^>]+)>/gi)) {
    const key = attributes.match(/(?:property|name)="([^"]+)"/i)?.[1];
    const content = attributes.match(/content="([^"]*)"/i)?.[1];
    if (!key || content === undefined) continue;
    assert.ok(!tags.has(key), `${filename}: duplicate ${key}`);
    tags.set(key, content);
  }
  assert.equal(tags.get('og:url'), pageUrl);
  assert.equal(tags.get('og:type'), 'website');
  assert.equal(tags.get('og:site_name'), 'luluske?');
  assert.equal(tags.get('og:locale'), 'en_GB');
  assert.ok(tags.get('og:title')?.startsWith('luluske?'));
  assert.ok(tags.get('og:description')?.includes('final exam'));
  assert.equal(tags.get('description'), tags.get('og:description'));
  assert.equal(tags.get('og:image'), imageUrl);
  assert.equal(tags.get('og:image:secure_url'), imageUrl);
  assert.equal(tags.get('og:image:type'), 'image/png');
  assert.equal(tags.get('og:image:width'), '1200');
  assert.equal(tags.get('og:image:height'), '630');
  assert.ok(tags.get('og:image:alt'));
  assert.equal(tags.get('twitter:card'), 'summary_large_image');
  for (const field of ['title', 'description', 'image', 'image:alt']) {
    assert.equal(tags.get(`twitter:${field}`), tags.get(`og:${field}`));
  }
}

verifyMetadata(path.join(projectRoot, 'src/index.html'));
verifyMetadata(path.join(output, 'index.html'));
const image = fs.readFileSync(path.join(output, 'assets/luluske-og.png'));
assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
assert.deepEqual(image, fs.readFileSync(path.join(projectRoot, 'src/assets/luluske-og.png')));
console.log('Social metadata verified in source and built HTML; 1200 × 630 PNG copied correctly.');
