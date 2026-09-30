import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPng(width, height, r, g, b, isMaskable = false) {
  // Simple PNG generator with Kyte Green and white icon area in center
  const buffer = Buffer.alloc(width * height * 4 + height);
  let pos = 0;

  const centerX = width / 2;
  const centerY = height / 2;
  const iconRadius = isMaskable ? width * 0.32 : width * 0.38;

  for (let y = 0; y < height; y++) {
    buffer[pos++] = 0; // Filter byte: none
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Icon pattern: Cash register / cart shape in center
      const inBox = Math.abs(dx) < iconRadius * 0.7 && Math.abs(dy) < iconRadius * 0.6;
      const inCorner = Math.abs(dx) > iconRadius * 0.6 && Math.abs(dy) > iconRadius * 0.5;

      if (inBox && !inCorner && (dist < iconRadius * 0.65 || (Math.abs(dy) > iconRadius * 0.2 && Math.abs(dx) < iconRadius * 0.4))) {
        // Crisp White icon symbol
        buffer[pos++] = 255;
        buffer[pos++] = 255;
        buffer[pos++] = 255;
        buffer[pos++] = 255;
      } else {
        // Kyte POS Emerald Green (#00A86B -> r: 0, g: 168, b: 107)
        buffer[pos++] = r;
        buffer[pos++] = g;
        buffer[pos++] = b;
        buffer[pos++] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(buffer);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNG icons (Kyte Emerald #059669 / #00A86B)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 5, 150, 105, true));

// Create icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#059669"/>
  <rect x="100" y="120" width="312" height="280" rx="32" fill="white"/>
  <rect x="140" y="160" width="232" height="70" rx="16" fill="#047857"/>
  <circle cx="180" cy="195" r="16" fill="#A7F3D0"/>
  <circle cx="256" cy="195" r="16" fill="#A7F3D0"/>
  <circle cx="332" cy="195" r="16" fill="#A7F3D0"/>
  <!-- Keypad buttons -->
  <circle cx="170" cy="275" r="18" fill="#E2E8F0"/>
  <circle cx="230" cy="275" r="18" fill="#E2E8F0"/>
  <circle cx="290" cy="275" r="18" fill="#E2E8F0"/>
  <circle cx="348" cy="275" r="18" fill="#10B981"/>
  
  <circle cx="170" cy="335" r="18" fill="#E2E8F0"/>
  <circle cx="230" cy="335" r="18" fill="#E2E8F0"/>
  <circle cx="290" cy="335" r="18" fill="#E2E8F0"/>
  <rect x="330" y="317" width="36" height="36" rx="10" fill="#059669"/>
  <path d="M342 335h12M348 329v12" stroke="white" stroke-width="3" stroke-linecap="round"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);
console.log('Icons generated successfully.');
