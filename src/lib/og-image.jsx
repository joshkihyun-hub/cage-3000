import { ImageResponse } from 'next/og';
import { readImageSize, readPublicImage } from '@/lib/image-size';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

// 링크 공유 이미지(카카오톡·인스타그램 DM·X) — 텍스트 없이 사진 한 장만 1200×630을 꽉 채운다.
// 세로 사진은 위아래가 잘리므로 focusY(0=위, 0.5=가운데, 1=아래)로 남길 위치를 정한다.
// 모델이 쓴 모자는 대개 사진 윗부분에 있어서 기본값을 위쪽으로 치우쳐 둔다.
// 빌드 때 정적으로 생성되므로 public/ 파일을 직접 읽는다.
export async function renderOgImage({ image, focusY = 0.3 }) {
  const data = await readPublicImage(image);
  const { width, height } = readImageSize(data);

  // Next의 이미지 렌더러(satori)는 object-position을 지원하지 않아 cover 크롭을 직접 계산한다.
  const scale = Math.max(OG_SIZE.width / width, OG_SIZE.height / height);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#ffffff' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={Uint8Array.from(data).buffer}
          alt=""
          width={w}
          height={h}
          style={{
            position: 'absolute',
            left: Math.round((OG_SIZE.width - w) / 2),
            top: Math.round((OG_SIZE.height - h) * focusY),
          }}
        />
      </div>
    ),
    OG_SIZE
  );
}
