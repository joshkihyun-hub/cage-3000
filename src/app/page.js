"use client";

import { useEffect, useRef } from 'react';

// 같은 소재의 세 가지 인코딩. `<source media>`는 <video>에서 무시되므로
// (스펙에서 빠졌다) 어느 파일을 받을지는 JS가 직접 정한다.
//   데스크톱 HEVC 1080p / 모바일 HEVC 720p / H.264 720p 폴백
// 모바일 패널이 345px라 720p면 DPR 3에서도 충분하다.
const HEVC_1080 = 'video/mp4; codecs="hvc1.1.6.L120.B0"';
const HEVC_720 = 'video/mp4; codecs="hvc1.1.6.L93.B0"';
const MOBILE_QUERY = '(max-width: 767.98px)';   // Tailwind md 브레이크포인트와 같은 경계

// 길이가 제각각이다(25 / 36.29 / 18초). hero-1과 hero-2는 빈 흰 화면에서
// 걸어 들어와 작업 중에 끝나서 흰색 디졸브로 잇고, hero-3은 소재 안에서 첫
// 프레임과 끝 프레임이 실제로 일치하는 구간을 찾아 잘라내 전환 없이 이어 붙는다.
// 셋을 맞춰 출발시키지도, 동기를 유지하지도 않는다 — 길이가 다르니 세 패널의
// 조합은 사실상 반복되지 않는다.
//
// veiled: 아직 공개 전이라 가려둔 패널. 공개할 때 false로 바꾸기만 하면 된다.
// seam:   루프 이음새에 처리가 필요한 패널. 자체 루프가 맞는 소재는 false다.
// still:  재생이 막혔을 때 걸어둘 장면(초). `${key}-still.jpg`가 인코딩된 영상의
//         바로 이 시점 프레임이라, 터치로 풀리면 정지 화면에서 그대로 움직인다.
//         첫 프레임부터 인물이 보이는 소재는 null — 기존 포스터로 충분하다.
const PANELS = [
  // 맨 위 — test3, 남자. 먼저 공개하는 영상이라 가리지 않는다.
  // 좌우를 뒤집어 걷는 방향을 돌렸다. CSS는 translate를 적용한 뒤 scale을
  // 걸어서(p -> T - p) 미러가 이동까지 뒤집는다 — 뒤집지 않았다면 +9%였을
  // 자리에 -9%가 들어가 있다.
  // 인물이 걸어 들어오는 도입부를 시작점으로 잡았다(원본 6.95s + 25.00s).
  // 빈 흰 화면에서 시작해 작업 중에 끝나므로 자체 루프가 맞지 않는다 —
  // 흰색 디졸브 + 디포커스로 잇는다.
  { key: 'hero-1', shift: 'translate-x-[-9%]', mirrored: true, veiled: false, seam: true, still: 8 },
  // 중앙 — web bed, 두 사람이 양 끝에서 들어와 가운데서 만나 작업한다.
  // 직접 편집한 최종본을 통째로 쓴다(36.29초). hero-1처럼 빈 흰 화면에서 시작해
  // 작업 중에 끝나므로 흰색 디졸브 + 디포커스로 잇는다. 중심 오차 -1.9%라 이동 없음.
  // /asset은 하루 캐시라 같은 이름으로 덮으면 재방문자에게 옛 영상이 남는다 —
  // 소재를 바꿀 때는 파일명을 바꾼다(순서 번호는 유지).
  { key: 'hero-2-bed', shift: null, mirrored: false, veiled: false, seam: true, still: 16 },
  // 맨 아래 — test2, 여자. 소재가 중앙에서 5% 오른쪽에 잡혀 있다.
  // 81.25s + 18.00s 구간이 스스로 맞물린다(실측 0.66).
  { key: 'hero-3', shift: 'translate-x-[-5%]', mirrored: false, veiled: true, seam: false, still: null },
];

// 자동재생이 막히는 곳이 있다 — 저전력 모드의 iPhone, 그리고 인스타그램 같은
// 인앱 브라우저(WKWebView 기본값이 음소거 영상에도 터치를 요구한다). 이때는
// 정지 화면을 걸어두고 화면 어디든 첫 터치에서 재생을 건다. 로고를 눌러 홈을
// 다시 띄우면 되던 것도 같은 원리다 — 터치 직후 몇 초는 재생이 허락된다.
const UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
const UNLOCK_OPTS = { capture: true, passive: true };

// 가려둔 패널. 블러만 세게 걸면 어두운 인물이 패널 전체로 번지고 래퍼가
// 네모로 잘라내서 "회색 사각형"이 된다 — 그동안 지켜온 경계 안 보임이 깨진다.
// 그래서 셋을 같이 쓴다: 적당한 블러 + 낮은 불투명도(흰 배경 위로 옅게) +
// 가장자리 마스크(네모 테두리를 지운다).
// blur()는 퍼센트를 못 받아서 패널 높이에 비례시키는 계산만 JS로 한다.
const VEIL_RATIO = 0.05;
const VEIL_OPACITY = 0.5;
const VEIL_EDGE =
  'linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%), ' +
  'linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)';
const VEIL_MASK = {
  WebkitMaskImage: VEIL_EDGE,
  maskImage: VEIL_EDGE,
  WebkitMaskComposite: 'source-in',
  maskComposite: 'intersect',
};

// 루프 이음새. 인코딩에 구워둔 0.8초 흰색 디졸브 위에 그보다 먼저 시작하는
// 디포커스를 얹어, 편집 전환이 아니라 초점이 풀려 흰 공간에 녹아드는 것처럼
// 읽히게 한다. Tailwind의 brightness도 filter라서 같이 써줘야 한다.
const DEFOCUS_LEAD = 1.6;
const DEFOCUS_MAX = 14;
const BASE_FILTER = 'brightness(1.01)';
// 블러는 요소 경계 바깥까지 번져서, 그냥 두면 지금까지 안 보이던 패널 테두리가
// 흐릿하게 드러난다. 번지는 만큼 살짝 확대해 래퍼(overflow-hidden)가 잘라내게
// 한다. 블러는 절대 px인데 확대는 비율이라 짧은 변(높이) 기준으로 잡아야 한다.
const DEFOCUS_BLEED = 2.2;

function pickSource(key, { isMobile, canHevc1080, canHevc720 }) {
  if (isMobile) {
    return canHevc720 ? `/asset/video/${key}-720-hevc.mp4` : `/asset/video/${key}.mp4`;
  }
  return canHevc1080 ? `/asset/video/${key}-hevc.mp4` : `/asset/video/${key}.mp4`;
}

export default function HomePage() {
  // ref 배열을 렌더마다 새로 만들면 훅 의존성이 매번 바뀐다 — 하나의 ref에 모아둔다.
  const videosRef = useRef([]);

  useEffect(() => {
    const videos = videosRef.current.filter(Boolean);
    if (videos.length !== PANELS.length) return;

    // React는 SSR 마크업에 muted "속성"을 찍지 않고 프로퍼티로만 넣는다 —
    // 하이드레이션 전에 브라우저가 소리 있는 영상으로 보고 자동재생을 막는
    // 경우가 있어 마운트 시 직접 세운다.
    videos.forEach((v) => {
      v.muted = true;
    });

    // 화면 크기와 코덱 지원을 보고 받을 파일을 고른다. 마크업에 <source>를
    // 두지 않는 이유는, 두면 브라우저가 판단 전에 이미 받기 시작하기 때문이다.
    const support = {
      isMobile: window.matchMedia(MOBILE_QUERY).matches,
      canHevc1080: videos[0].canPlayType(HEVC_1080) !== '',
      canHevc720: videos[0].canPlayType(HEVC_720) !== '',
    };
    videos.forEach((v, i) => {
      v.src = pickSource(PANELS[i].key, support);
    });

    // 길이가 제각각이라 맞춰 출발시킬 이유가 없다 — 준비되는 대로 각자 돈다.
    // play()는 데이터를 기다리지 않고 바로 건다. canplay를 기다렸다 부르면, 터치
    // 전에는 데이터 로딩조차 막는 인앱 브라우저에서 canplay가 영영 오지 않는다.
    let cancelled = false;

    // 막힌 패널은 정지 화면으로 바꿔 걸고 재생 위치를 그 장면으로 옮겨둔다.
    // 아직 데이터가 없어도 currentTime은 시작 위치로 기억됐다가 적용된다.
    const held = new Set();
    const hold = (v, i) => {
      if (held.has(v)) return;
      held.add(v);
      const { key, still } = PANELS[i];
      if (still == null) return;
      v.poster = `/asset/video/${key}-still.jpg`;
      v.currentTime = still;
    };

    // play()는 반드시 이 핸들러 안에서 바로 불러야 한다 — 한 틱이라도 미루면
    // 사용자 터치로 인정받지 못한다. 허락되면 paused가 즉시 false가 된다.
    let listening = false;
    const unlock = () => {
      videos.forEach((v, i) => {
        if (v.paused) start(v, i);
      });
      if (videos.every((v) => !v.paused)) unlisten();
    };
    const listen = () => {
      if (listening) return;
      listening = true;
      UNLOCK_EVENTS.forEach((t) => window.addEventListener(t, unlock, UNLOCK_OPTS));
    };
    const unlisten = () => {
      if (!listening) return;
      listening = false;
      UNLOCK_EVENTS.forEach((t) => window.removeEventListener(t, unlock, UNLOCK_OPTS));
    };

    const start = (v, i) =>
      v.play().catch((err) => {
        if (cancelled || err?.name !== 'NotAllowedError') return;
        hold(v, i);
        listen();
      });

    videos.forEach((v, i) => start(v, i));

    // 패널 높이는 ResizeObserver로 캐시해둔다 — rAF 안에서 매 프레임 레이아웃을
    // 조회하면 강제 리플로가 걸린다.
    const panelHeights = videos.map((v) => v.getBoundingClientRect().height || 1);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const i = videos.indexOf(e.target);
        if (i >= 0) panelHeights[i] = e.contentRect.height || panelHeights[i];
      }
    });
    videos.forEach((v) => ro.observe(v));

    // 가림 블러 + 이음새 디포커스를 합쳐 한자리에서 적용한다. 이음새 쪽은
    // currentTime에서 직접 계산하므로 루프와 절대 어긋나지 않는다.
    // 마지막으로 칠한 블러 값. 대부분의 프레임은 값이 그대로라(가림 블러는 고정,
    // 디포커스는 끝 1.6초만) 바뀐 프레임에만 style을 건드린다.
    const lastBlur = videos.map(() => -1);
    let raf = 0;
    const paint = () => {
      videos.forEach((v, i) => {
        const h = panelHeights[i];
        const left = v.duration - v.currentTime;
        const t = Number.isFinite(left) ? Math.max(0, 1 - left / DEFOCUS_LEAD) : 0;
        // 뒤로 갈수록 가파르게 — 앞부분에서는 거의 티가 나지 않는다
        const raw =
          (PANELS[i].veiled ? h * VEIL_RATIO : 0) +
          (PANELS[i].seam ? DEFOCUS_MAX * t * t : 0);
        const blur = raw < 0.05 ? 0 : Math.round(raw * 100) / 100;
        if (blur === lastBlur[i]) return;
        lastBlur[i] = blur;
        if (blur === 0) {
          v.style.filter = BASE_FILTER;
          v.style.scale = '';   // 비워두면 Tailwind의 scale-x-[-1]이 다시 먹는다
          return;
        }
        v.style.filter = `${BASE_FILTER} blur(${blur.toFixed(2)}px)`;
        const k = 1 + (DEFOCUS_BLEED * blur) / h;
        v.style.scale = PANELS[i].mirrored ? `${-k} ${k}` : `${k} ${k}`;
      });
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);

    return () => {
      cancelled = true;
      unlisten();
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="bg-white">
      <h1 className="sr-only">CAGE3000 — Designer Fashion from Seoul</h1>

      {/* Hero Section — 대표 영상 세 편.
          모두 화이트 그레이딩이라 배경이 순백이고 페이지도 흰 배경이라 패널
          경계가 보이지 않는다. 세로 화면에서는 위아래로 쌓고, 가로가 넉넉한
          md+에서만 나란히 놓는다.

          brightness(1.01)은 영상 흰 배경이 254라서 넣는다 — 그냥 두면 순백(255)인
          페이지 위에 옅은 회색 사각형으로 테두리가 드러난다. 어두운 쪽은 그대로다. */}
      <section className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-white px-6 py-10 md:gap-6 md:px-12 md:py-16">
        {/* 링크가 아니다 — 영상은 보여주기만 하고 아무 반응도 하지 않는다.
            pointer-events-none이어야 커서 모양·우클릭 메뉴·탭 반응까지 안 생긴다. */}
        <div className="flex w-full flex-col items-center gap-4 pointer-events-none select-none md:flex-row md:gap-6">
          {PANELS.map((panel, i) => (
            <div
              key={panel.key}
              className="block w-full min-w-0 aspect-video overflow-hidden md:w-auto md:flex-1"
              style={panel.veiled ? VEIL_MASK : undefined}
            >
              {/* src는 위 이펙트가 넣는다 — 화면 크기에 따라 파일이 달라진다.
                  autoplay 속성은 일부러 뺐다. iOS는 저전력 모드에서 autoplay가
                  붙은 영상에 기본 재생 버튼을 강제로 띄우는데, 미러·가림 블러까지
                  같이 먹어서 깨진 화면처럼 보인다. 재생은 이펙트의 play()가 건다. */}
              <video
                ref={(el) => {
                  videosRef.current[i] = el;
                }}
                className={[
                  'block h-full w-full object-contain brightness-[1.01]',
                  panel.shift ?? '',
                  panel.mirrored ? 'scale-x-[-1]' : '',
                ].join(' ')}
                style={panel.veiled ? { opacity: VEIL_OPACITY } : undefined}
                poster={`/asset/video/${panel.key}-poster.jpg`}
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                aria-hidden="true"
              />
            </div>
          ))}
        </div>

        {/* 날짜. tracking은 마지막 글자 뒤에도 자간을 붙여 글자 뭉치가 그만큼
            왼쪽으로 쏠리므로, -0.25em으로 꼬리를 걷어내야 잉크가 중앙에 온다. */}
        <span className="mr-[-0.25em] font-serif text-[11px] tracking-[0.25em] text-zinc-400">
          2026.10
        </span>
      </section>
    </div>
  );
}
