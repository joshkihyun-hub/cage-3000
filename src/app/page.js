"use client";

import { useEffect, useRef, useSyncExternalStore } from 'react';

// 같은 소재의 세 가지 인코딩. `<source media>`는 <video>에서 무시되므로
// (스펙에서 빠졌다) 어느 파일을 받을지는 JS가 직접 정한다.
//   데스크톱 HEVC 1080p / 모바일 HEVC 720p / H.264 720p 폴백
// 모바일 패널이 345px라 720p면 DPR 3에서도 충분하다.
const HEVC_1080 = 'video/mp4; codecs="hvc1.1.6.L120.B0"';
const HEVC_720 = 'video/mp4; codecs="hvc1.1.6.L93.B0"';
const MOBILE_QUERY = '(max-width: 767.98px)';   // Tailwind md 브레이크포인트와 같은 경계

// 세 편 모두 871프레임(36.29초)으로 길이가 같다. 빈 흰 화면에서 시작해 0.7초쯤
// 인물이 들어오고, 끝 0.8초에 흰색으로 디졸브된다 — 셋이 같이 출발해 같이 들어오고
// 같이 흰 공간에 녹아든 뒤 같이 다시 시작한다(아래 동기화).
// 등장 프레임은 인코딩된 결과물에서 재서 맞췄다(hero-2-bed 기준 0.71~0.79초):
//   hero-1-stool = final stool 원본 161프레임(6.71초)부터, hero-3-stool = women stool 처음부터.
//
// shift: 인물이 프레임 중앙에서 벗어난 만큼 미는 값. hero-3-stool은 크롭 창 자체를
//        오른쪽으로 146px 옮겨 구웠다(292,165) — 그래서 이동이 없다.
//
// STILL_AT: <img>로도 못 움직이는 브라우저에서 걸어둘 장면(초). `${key}-still.jpg`가
//           인코딩된 영상의 바로 이 시점 프레임이라, 터치로 풀리면 정지 화면에서
//           그대로 움직인다. 셋이 같은 시점이어야 풀릴 때도 맞춰서 움직인다.
//
// /asset은 하루 캐시라 같은 이름으로 덮으면 재방문자에게 옛 영상이 남는다 —
// 소재나 구간을 바꿀 때는 파일명을 바꾼다(순서 번호는 유지하고 소재명을 붙인다).
const STILL_AT = 16;
const PANELS = [
  // 맨 위 — 남자. 좌우를 뒤집어 오른쪽에서 걸어 들어온다. CSS는 translate를 적용한
  // 뒤 scale을 걸어서(p -> T - p) 미러가 이동까지 뒤집는다 — 뒤집지 않았다면
  // +9%였을 자리에 -9%가 들어가 있다.
  { key: 'hero-1-stool', shift: 'translate-x-[-9%]', mirrored: true },
  // 중앙 — web bed, 두 사람이 양 끝에서 들어와 가운데서 만나 작업한다.
  // 직접 편집한 최종본을 통째로 쓴다. 이 길이가 셋의 기준이다.
  { key: 'hero-2-bed', shift: null, mirrored: false },
  // 맨 아래 — 여자. 왼쪽에서 걸어 들어와 무릎을 꿇고 작업한다.
  { key: 'hero-3-stool', shift: null, mirrored: false },
];

// 동기화. 한 번 같이 출발시켜도 디코딩이 밀리거나 루프를 도는 순간의 지연이
// 영상마다 달라서 조금씩 벌어진다. 가운데 패널을 기준으로 주기적으로 재서,
// 조금 벌어졌으면 재생 속도를 살짝 바꿔 따라잡고(눈에 안 띈다), 많이 벌어졌으면
// 그 자리로 옮긴다.
const SYNC_EVERY = 250;       // ms
const SYNC_TOLERANCE = 1 / 24; // 한 프레임 안쪽이면 그대로 둔다
const SYNC_NUDGE = 0.05;      // 속도 보정은 ±5%까지
const SYNC_SNAP = 0.3;        // 이보다 벌어지면 바로 옮긴다
// 먼저 준비된 패널은 첫 프레임(흰 화면)에서 나머지를 기다린다. 한 패널의 네트워크가
// 유난히 느리면 이만큼만 기다리고 출발한다 — 늦은 패널은 따라붙는다.
const START_WAIT = 4000;

// 자동재생이 막히는 곳이 있다 — 저전력 모드의 iPhone, 그리고 인스타그램 같은
// 인앱 브라우저(WKWebView 기본값이 음소거 영상에도 터치를 요구하고, 앱 설정이라
// 페이지에서는 풀 수 없다). 로고를 눌러 홈을 다시 띄우면 되던 것도 터치 직후
// 몇 초는 재생이 허락되기 때문이다.
//
// 그래서 막히면 같은 영상을 <img>로 띄운다. WebKit은 <img>에 넣은 MP4를 GIF처럼
// 움직이는 이미지로 디코딩하는데, 미디어가 아니라서 자동재생 정책이 닿지 않는다.
// 다만 파일을 다 받은 뒤에야 움직이므로 모바일용 720p를 쓴다.
// 이음새 디포커스는 CSS가 currentTime을 보고 거는 효과라 <img>에서는 걸 수 없다 —
// 그 디포커스를 모바일 기준으로 구워 넣은 `${key}-img.mp4`를 쓴다.
// <img>는 처음 화면에 그려지는 순간부터 움직이므로, 셋 다 받은 뒤 한꺼번에 드러내면
// 같이 출발한다(길이가 같으니 루프도 같이 돈다).
//
// <img>로도 안 되는 브라우저(크로뮴 계열)는 정지 화면을 걸어두고 화면 어디든
// 첫 터치에서 재생을 건다.
const UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
const UNLOCK_OPTS = { capture: true, passive: true };

const imageSource = ({ key }) => `/asset/video/${key}-img.mp4`;

// 루프 이음새. 인코딩에 구워둔 0.8초 흰색 디졸브 위에 그보다 먼저 시작하는
// 디포커스를 얹어, 편집 전환이 아니라 초점이 풀려 흰 공간에 녹아드는 것처럼
// 읽히게 한다.
const DEFOCUS_LEAD = 1.6;
const DEFOCUS_MAX = 14;
// 블러는 요소 경계 바깥까지 번져서, 그냥 두면 지금까지 안 보이던 패널 테두리가
// 흐릿하게 드러난다. 번지는 만큼 살짝 확대해 래퍼(overflow-hidden)가 잘라내게
// 한다. 블러는 절대 px인데 확대는 비율이라 짧은 변(높이) 기준으로 잡아야 한다.
const DEFOCUS_BLEED = 2.2;

function pickSource({ key }, { isMobile, canHevc1080, canHevc720 }) {
  if (isMobile) {
    return canHevc720 ? `/asset/video/${key}-720-hevc.mp4` : `/asset/video/${key}.mp4`;
  }
  return canHevc1080 ? `/asset/video/${key}-hevc.mp4` : `/asset/video/${key}.mp4`;
}

// 공개 시각 — 2026.10.12 18:00 KST. 해외에서 봐도 같은 순간을 향해 줄어든다.
const LAUNCH_AT = Date.parse('2026-10-12T18:00:00+09:00');

// 초가 바뀌는 순간에 맞춰 깨운다 — setInterval(1000)은 조금씩 밀려서 가끔 한 초를 건너뛴다.
function subscribeSecond(onTick) {
  let timer;
  const schedule = () => {
    timer = setTimeout(() => {
      onTick();
      schedule();
    }, 1000 - (Date.now() % 1000));
  };
  schedule();
  return () => clearTimeout(timer);
}
const currentSecond = () => Math.floor(Date.now() / 1000);
// 페이지는 빌드 때 미리 그려진다 — 그때 시각으로 그리면 며칠 전 숫자가 잠깐 비친다.
const noSecond = () => null;

const pad = (n) => String(n).padStart(2, '0');

function Countdown() {
  const now = useSyncExternalStore(subscribeSecond, currentSecond, noSecond);
  const left = now === null ? null : LAUNCH_AT / 1000 - now;

  if (left !== null && left <= 0) return '2026.10.12';

  // 시각을 모르는 첫 화면에는 같은 폭의 자리만 잡아둔다 — 숫자가 들어올 때 줄이 흔들리지 않게.
  if (left === null) return <span className="invisible">00D 00:00:00</span>;

  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  return `${pad(d)}D ${pad(h)}:${pad(m)}:${pad(left % 60)}`;
}

export default function HomePage() {
  // ref 배열을 렌더마다 새로 만들면 훅 의존성이 매번 바뀐다 — 하나의 ref에 모아둔다.
  const videosRef = useRef([]);
  const imagesRef = useRef([]);

  useEffect(() => {
    const videos = videosRef.current.filter(Boolean);
    const images = imagesRef.current.filter(Boolean);
    if (videos.length !== PANELS.length || images.length !== PANELS.length) return;

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
    const sources = PANELS.map((p) => pickSource(p, support));
    videos.forEach((v, i) => {
      v.src = sources[i];
    });

    // play()는 데이터를 기다리지 않고 바로 건다. canplay를 기다렸다 부르면, 터치
    // 전에는 데이터 로딩조차 막는 인앱 브라우저에서 canplay가 영영 오지 않는다.
    // play()가 통과했다는 건 그 패널이 재생할 준비가 됐다는 뜻이기도 하다 — 먼저
    // 통과한 패널은 첫 프레임(빈 흰 화면)에 세워두고 나머지를 기다렸다가, 다 모이면
    // 같은 위치에서 한꺼번에 출발시킨다.
    let cancelled = false;
    let started = false;
    let startAt = 0;            // 출발 위치 — 정지 화면에서 풀리면 그 장면부터
    let waitTimer = 0;
    const ready = new Set();    // play()가 통과한 패널
    const diverted = new Set(); // 막혀서 <img>로 넘긴 패널
    const imaged = new Set();   // <img>가 자리를 넘겨받아 움직이고 있는 패널

    const launch = () => {
      if (started || cancelled) return;
      started = true;
      clearTimeout(waitTimer);
      ready.forEach((i) => {
        videos[i].currentTime = startAt;
        videos[i].play().catch(() => {});
      });
    };

    // <img>로도 못 움직이는 패널은 정지 화면으로 바꿔 걸고 재생 위치를 그 장면으로
    // 옮겨둔다. 아직 데이터가 없어도 currentTime은 시작 위치로 기억됐다가 적용된다.
    const held = new Set();
    const hold = (v, i) => {
      if (held.has(v)) return;
      held.add(v);
      v.poster = `/asset/video/${PANELS[i].key}-still.jpg`;
      v.currentTime = STILL_AT;
    };

    // play()는 반드시 이 핸들러 안에서 바로 불러야 한다 — 한 틱이라도 미루면
    // 사용자 터치로 인정받지 못한다. 허락되면 paused가 즉시 false가 된다.
    // 셋이 같은 정지 장면에서 같이 풀리므로 기다리지 않고 바로 출발한다(어긋나는
    // 만큼은 아래 동기화가 맞춘다). <img>로 넘어간 패널은 이미 움직이고 있으니 건드리지 않는다.
    let listening = false;
    const unlock = () => {
      if (!started) {
        startAt = STILL_AT;
        started = true;
        clearTimeout(waitTimer);
      }
      const waiting = videos.filter((_, i) => !imaged.has(i));
      waiting.forEach((v) => {
        if (v.paused) start(v, videos.indexOf(v));
      });
      if (waiting.every((v) => !v.paused)) unlisten();
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

    // 막히면 영상 다운로드부터 끊고(포스터는 그대로 보인다) <img>를 받는다.
    // <img>는 처음 그려지는 순간 움직이기 시작하므로, 넘긴 패널이 전부 다 받을
    // 때까지 숨겨뒀다가 한꺼번에 드러낸다.
    const loaded = new Set();
    const settled = new Set();
    const reveal = () => {
      if (settled.size < diverted.size) return;
      loaded.forEach((i) => {
        imaged.add(i);
        images[i].hidden = false;
        videos[i].hidden = true;
      });
    };
    const toImage = (v, i) => {
      const img = images[i];
      if (img.getAttribute('src')) return;
      diverted.add(i);
      v.removeAttribute('src');
      v.load();
      img.onload = () => {
        if (cancelled) return;
        loaded.add(i);
        settled.add(i);
        reveal();
      };
      img.onerror = () => {
        if (cancelled) return;
        settled.add(i);
        v.src = sources[i];
        hold(v, i);
        listen();
        reveal();
      };
      img.src = imageSource(PANELS[i]);
    };

    const start = (v, i) =>
      v
        .play()
        .then(() => {
          if (cancelled) return;
          ready.add(i);
          // 무리가 이미 출발했으면 그대로 둔다 — 늦게 온 만큼은 동기화가 따라붙인다.
          if (started) return;
          v.pause();
          v.currentTime = startAt;
          if (ready.size + diverted.size === PANELS.length) launch();
          else if (!waitTimer) waitTimer = setTimeout(launch, START_WAIT);
        })
        .catch((err) => {
          if (cancelled || err?.name !== 'NotAllowedError') return;
          toImage(v, i);
          // 막힌 패널 때문에 나머지가 계속 기다리지 않게 한다.
          if (!started && ready.size > 0 && ready.size + diverted.size === PANELS.length) launch();
        });

    videos.forEach((v, i) => start(v, i));

    // 가운데 패널을 기준으로 나머지를 맞춘다. 가운데가 멈춰 있거나 <img>로
    // 넘어갔으면 움직이고 있는 첫 패널이 기준이 된다.
    const sync = () => {
      if (!started) return;
      const live = videos.filter((v, i) => !imaged.has(i) && !v.paused && v.readyState >= 3);
      if (live.length < 2) return;
      const lead = live.includes(videos[1]) ? videos[1] : live[0];
      const length = lead.duration;
      if (!Number.isFinite(length)) return;
      live.forEach((v) => {
        if (v === lead) return;
        let drift = v.currentTime - lead.currentTime;
        drift -= length * Math.round(drift / length); // 한쪽만 루프를 돌았으면 짧은 쪽으로 잰다
        if (Math.abs(drift) > SYNC_SNAP) {
          v.currentTime = lead.currentTime;
          v.playbackRate = 1;
        } else if (Math.abs(drift) > SYNC_TOLERANCE) {
          // 앞서 있으면 느리게, 뒤처져 있으면 빠르게
          v.playbackRate = 1 - Math.max(-SYNC_NUDGE, Math.min(SYNC_NUDGE, drift));
        } else if (v.playbackRate !== 1) {
          v.playbackRate = 1;
        }
      });
    };
    const syncTimer = setInterval(sync, SYNC_EVERY);

    // 패널 높이는 ResizeObserver로 캐시해둔다 — 프레임마다 레이아웃을 조회하면
    // 강제 리플로가 걸린다. 영상이 <img>에 자리를 넘기며 숨어도 재도록 래퍼를 잰다.
    const wrappers = videos.map((v) => v.parentElement);
    const panelHeights = wrappers.map((w) => w.getBoundingClientRect().height || 1);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const i = wrappers.indexOf(e.target);
        if (i >= 0) panelHeights[i] = e.contentRect.height || panelHeights[i];
      }
    });
    wrappers.forEach((w) => ro.observe(w));

    // 이음새 디포커스 — 새 영상 프레임이 화면에 나올 때만 계산한다
    // (requestVideoFrameCallback, 24fps). 예전엔 rAF로 화면 주사율마다(60~120Hz)
    // 패널을 전부 훑었다. 재생 시각에서 직접 계산하므로 루프와 어긋나지 않는다.
    // <img>로 넘어간 패널은 영상 프레임이 더 안 나오니 저절로 멈춘다(디포커스는 파일에 구워져 있다).
    const stops = [];
    videos.forEach((v, i) => {
      const { mirrored } = PANELS[i];
      let last = 0;
      const apply = (time) => {
        const left = v.duration - time;
        const t = Number.isFinite(left) ? Math.max(0, 1 - left / DEFOCUS_LEAD) : 0;
        // 뒤로 갈수록 가파르게 — 앞부분에서는 거의 티가 나지 않는다
        const raw = DEFOCUS_MAX * t * t;
        const blur = raw < 0.05 ? 0 : Math.round(raw * 100) / 100;
        if (blur === last) return;
        last = blur;
        if (blur === 0) {
          v.style.filter = '';
          v.style.scale = '';    // 비워두면 Tailwind의 scale-x-[-1]이 다시 먹는다
          return;
        }
        v.style.filter = `blur(${blur.toFixed(2)}px)`;
        const k = 1 + (DEFOCUS_BLEED * blur) / panelHeights[i];
        v.style.scale = mirrored ? `${-k} ${k}` : `${k} ${k}`;
      };
      if ('requestVideoFrameCallback' in v) {
        let handle = 0;
        const onFrame = (_, meta) => {
          apply(meta.mediaTime);
          handle = v.requestVideoFrameCallback(onFrame);
        };
        handle = v.requestVideoFrameCallback(onFrame);
        stops.push(() => v.cancelVideoFrameCallback(handle));
      } else {
        let raf = 0;
        const loop = () => {
          apply(v.currentTime);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        stops.push(() => cancelAnimationFrame(raf));
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(waitTimer);
      clearInterval(syncTimer);
      unlisten();
      stops.forEach((stop) => stop());
      ro.disconnect();
    };
  }, []);

  return (
    <div className="bg-white">
      <h1 className="sr-only">CAGE3000 — Designer Fashion from Seoul</h1>

      {/* Hero Section — 대표 영상 세 편.
          모두 화이트 그레이딩이라 배경이 순백이고 페이지도 흰 배경이라 패널
          경계가 보이지 않는다. 세로 화면에서는 위아래로 쌓고, 가로가 넉넉한
          md+에서만 나란히 놓는다. */}
      <section className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-white px-6 py-10 md:gap-6 md:px-12 md:py-16">
        {/* 링크가 아니다 — 영상은 보여주기만 하고 아무 반응도 하지 않는다.
            pointer-events-none이어야 커서 모양·우클릭 메뉴·탭 반응까지 안 생긴다. */}
        <div className="flex w-full flex-col items-center gap-4 pointer-events-none select-none md:flex-row md:gap-6">
          {PANELS.map((panel, i) => (
            <div
              key={panel.key}
              className="relative block w-full min-w-0 aspect-video overflow-hidden md:w-auto md:flex-1"
            >
              {/* src는 위 이펙트가 넣는다 — 화면 크기에 따라 파일이 달라진다.
                  autoplay 속성은 일부러 뺐다. iOS는 저전력 모드에서 autoplay가
                  붙은 영상에 기본 재생 버튼을 강제로 띄우는데, 미러까지
                  같이 먹어서 깨진 화면처럼 보인다. 재생은 이펙트의 play()가 건다. */}
              <video
                ref={(el) => {
                  videosRef.current[i] = el;
                }}
                className={[
                  'block h-full w-full object-contain',
                  panel.shift ?? '',
                  panel.mirrored ? 'scale-x-[-1]' : '',
                ].join(' ')}
                poster={`/asset/video/${panel.key}-poster.jpg`}
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                aria-hidden="true"
              />
              {/* 자동재생이 막혔을 때 영상 대신 띄우는 자리 — src는 이펙트가 그때 넣는다.
                  영상과 같은 이동·미러가 먹는다. 디포커스를 구운 -img.mp4는 흰색이 254라
                  밝기를 올린다. next/image는 MP4를 못
                  다뤄서 일반 img를 쓴다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => {
                  imagesRef.current[i] = el;
                }}
                className={[
                  'absolute inset-0 block h-full w-full object-contain',
                  'brightness-[1.01]',
                  panel.shift ?? '',
                  panel.mirrored ? 'scale-x-[-1]' : '',
                ].join(' ')}
                alt=""
                aria-hidden="true"
                draggable={false}
                hidden
              />
            </div>
          ))}
        </div>

        {/* 공개까지 남은 시간. 지나면 공개 날짜만 남는다. tracking은 마지막 글자
            뒤에도 자간을 붙여 글자 뭉치가 그만큼 왼쪽으로 쏠리므로, -0.25em으로
            꼬리를 걷어내야 잉크가 중앙에 온다. tabular-nums — 숫자 폭이 같아야
            초가 바뀔 때 줄이 좌우로 떨지 않는다. */}
        <time
          dateTime="2026-10-12T18:00:00+09:00"
          className="mr-[-0.25em] font-serif text-[11px] tracking-[0.25em] text-zinc-400 tabular-nums"
        >
          <Countdown />
        </time>
      </section>
    </div>
  );
}
