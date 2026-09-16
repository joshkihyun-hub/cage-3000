import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// PNG/JPEG 헤더에서 원본 픽셀 크기를 읽는다. next/image에 정확한 width·height를
// 넘기면 비율이 틀어지거나 로딩 중 레이아웃이 튀는 일이 없다.
export function readImageSize(buf) {
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    // SOF0–SOF15 (DHT·JPG·DAC 제외) 세그먼트에 높이·너비가 들어 있다.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: buf.readUInt16BE(offset + 7), height: buf.readUInt16BE(offset + 5) };
    }
    offset += 2 + buf.readUInt16BE(offset + 2);
  }
  throw new Error('Unsupported image format');
}

export async function readPublicImage(publicPath) {
  return readFile(join(process.cwd(), 'public', publicPath));
}

// 빌드 때(정적 생성) 호출하는 용도 — 서버에서만 쓸 것.
export async function getPublicImageSize(publicPath) {
  return readImageSize(await readPublicImage(publicPath));
}
