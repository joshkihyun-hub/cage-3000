"use client";

import Link from 'next/link';
import { useEffect, useRef, useSyncExternalStore } from 'react';

// 같은 소재의 세 가지 인코딩. `<source media>`는 <video>에서 무시되므로
// (스펙에서 빠졌다) 어느 파일을 받을지는 JS가 직접 정한다.
//   HEVC 1080p / HEVC 720p / H.264 720p 폴백
// 1080p는 패널이 실제 픽셀로 1300px을 넘는 큰 화면에서만 받는다 — 노트북(패널 432px × DPR 2
// = 864px)에선 720p로 충분하고, 세 편을 동시에 디코딩하는 일이 2.25배 가벼워져 끊김이 준다.
const HEVC_1080 = 'video/mp4; codecs="hvc1.1.6.L120.B0"';
const HEVC_720 = 'video/mp4; codecs="hvc1.1.6.L93.B0"';
const FULL_HD_FROM = 1300; // 패널의 실제 픽셀 폭이 이보다 크면 1080p

// 세 편 모두 871프레임(36.29초)으로 길이가 같다. 빈 흰 화면에서 시작해 0.7초쯤
// 인물이 들어오고, 끝 2.4초 동안 노출이 서서히 오르며(smootherstep) 초점이 그보다 늦게
// 풀리고 아주 살짝 다가가 흰 공간에 녹아든다 — 이 효과는 파일에 구워져 있어 재생 중
// 브라우저가 따로 계산하지 않는다(예전엔 CSS 블러를 매 프레임 걸어 루프 직전에 끊겼다).
// 셋이 같이 출발해 같이 들어오고 같이 녹아든 뒤 같이 다시 시작한다(아래 동기화).
// 키프레임이 1초마다라 동기화가 위치를 옮겨도 디코딩이 짧다.
// 등장 프레임은 인코딩된 결과물에서 재서 맞췄다(hero-2-bed 기준 0.71~0.79초):
//   hero-1-stool = final stool 원본 161프레임(6.71초)부터, hero-3-stool = women stool 처음부터.
//
// shift: 인물이 프레임 중앙에서 벗어난 만큼 미는 값. hero-3-stool은 크롭 창 자체를
//        오른쪽으로 146px 옮겨 구웠다(292,165) — 그래서 이동이 없다.
//
// STILL_AT: 영상을 받는 동안(STILL_AFTER 이후)이나 터치를 기다리는 동안 걸어둘 장면(초).
//           `${key}-still.jpg`가 인코딩된 영상의 바로 이 시점 프레임이라, 출발하면
//           정지 화면에서 그대로 움직인다. 셋이 같은 시점이어야 같이 움직인다.
//
// /asset은 하루 캐시라 같은 이름으로 덮으면 재방문자에게 옛 영상이 남는다 —
// 소재나 구간을 바꿀 때는 파일명을 바꾼다(순서 번호는 유지하고 소재명·판 번호(-r2)를 붙인다).
const STILL_AT = 16;
const PANELS = [
  // 맨 위 — 남자. 좌우를 뒤집어 오른쪽에서 걸어 들어온다. CSS는 translate를 적용한
  // 뒤 scale을 걸어서(p -> T - p) 미러가 이동까지 뒤집는다 — 뒤집지 않았다면
  // +9%였을 자리에 -9%가 들어가 있다.
  { key: 'hero-1-stool-r2', shift: 'translate-x-[-9%]', mirrored: true, href: '/shop/32', label: '11 — stool' },
  // 중앙 — web bed, 두 사람이 양 끝에서 들어와 가운데서 만나 작업한다.
  // 직접 편집한 최종본을 통째로 쓴다. 이 길이가 셋의 기준이다.
  { key: 'hero-2-bed-r2', shift: null, mirrored: false, href: '/shop/31', label: '10 — bed' },
  // 맨 아래 — 여자. 왼쪽에서 걸어 들어와 무릎을 꿇고 작업한다.
  { key: 'hero-3-stool-r2', shift: null, mirrored: false, href: '/shop/32', label: '11 — stool' },
];

// 동기화. 한 번 같이 출발시켜도 디코딩이 밀리거나 루프를 도는 순간의 지연이
// 영상마다 달라서 조금씩 벌어진다. 가운데 패널을 기준으로 주기적으로 재서,
// 조금 벌어졌으면 재생 속도를 살짝 바꿔 따라잡고(눈에 안 띈다), 많이 벌어졌으면
// 그 자리로 옮긴다.
const SYNC_EVERY = 250;       // ms
const SYNC_TOLERANCE = 1 / 24; // 한 프레임 안쪽이면 그대로 둔다
const SYNC_NUDGE = 0.05;      // 속도 보정은 ±5%까지
const SYNC_SNAP = 0.3;        // 이보다 벌어지면 바로 옮긴다
// 세 파일은 통째로 받은 뒤에 재생한다(아래 load). 그 사이 빈 흰 화면이 이보다
// 오래 가면 정지 장면(STILL_AT)을 걸어두고, 다 받으면 그 장면에서 그대로 출발한다.
const STILL_AFTER = 2000;
// 한 파일이 끝내 안 오면 이만큼 기다린 뒤 받은 패널끼리 출발한다 — 늦은 패널은 따라붙는다.
const START_GIVE_UP = 20000;

// 자동재생이 막히는 곳이 있다 — 저전력 모드의 iPhone, 그리고 인스타그램 같은
// 인앱 브라우저(WKWebView 기본값이 음소거 영상에도 터치를 요구하고, 앱 설정이라
// 페이지에서는 풀 수 없다). 로고를 눌러 홈을 다시 띄우면 되던 것도 터치 직후
// 몇 초는 재생이 허락되기 때문이다.
//
// 그래서 막히면 같은 영상을 <img>로 띄운다. WebKit은 <img>에 넣은 MP4를 GIF처럼
// 움직이는 이미지로 디코딩하는데, 미디어가 아니라서 자동재생 정책이 닿지 않는다.
// 다만 파일을 다 받은 뒤에야 움직이므로 720p를 쓴다(끝의 페이드는 파일에 구워져 있다).
// <img>는 처음 화면에 그려지는 순간부터 움직이므로, 셋 다 받은 뒤 한꺼번에 드러내면
// 같이 출발한다(길이가 같으니 루프도 같이 돈다).
//
// <img>로도 안 되는 브라우저(크로뮴 계열)는 정지 화면을 걸어두고 화면 어디든
// 첫 터치에서 재생을 건다.
const UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
const UNLOCK_OPTS = { capture: true, passive: true };

const imageSource = ({ key }) => `/asset/video/${key}-720-hevc.mp4`;

function pickSource({ key }, { fullHd, canHevc1080, canHevc720 }) {
  if (fullHd && canHevc1080) return `/asset/video/${key}-hevc.mp4`;
  return canHevc720 ? `/asset/video/${key}-720-hevc.mp4` : `/asset/video/${key}.mp4`;
}

// 공개 시각 — 2026.10.12 18:00 KST. 해외에서 봐도 같은 순간을 향해 줄어든다.
const LAUNCH_AT = Date.parse('2026-10-12T18:00:00+09:00');

// 초가 바뀌는 순간에 맞춰 깨운다 — setInterval(1000)은 조금씩 밀려서 가끔 한 초를 건너뛴다.
function subscribeSecond(onTick) {
  // 공개가 지나면 숫자가 더 바뀌지 않으니 깨우지 않는다.
  if (Date.now() >= LAUNCH_AT) return () => {};
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

    // 패널 크기와 코덱 지원을 보고 받을 파일을 고른다. 마크업에 <source>를
    // 두지 않는 이유는, 두면 브라우저가 판단 전에 이미 받기 시작하기 때문이다.
    const panelPx = videos[0].parentElement.getBoundingClientRect().width * (window.devicePixelRatio || 1);
    const support = {
      fullHd: panelPx > FULL_HD_FROM,
      canHevc1080: videos[0].canPlayType(HEVC_1080) !== '',
      canHevc720: videos[0].canPlayType(HEVC_720) !== '',
    };
    const sources = PANELS.map((p) => pickSource(p, support));
    const stillOf = (i) => `/asset/video/${PANELS[i].key}-still.jpg`;

    let cancelled = false;
    let started = false;
    let startAt = 0;            // 출발 위치 — 정지 장면을 걸어둔 뒤면 그 장면부터
    let needsTouch = false;     // 터치해야만 재생되는 브라우저 — 출발은 터치가 건다
    const blobUrls = [];
    const loading = new Set();
    const ready = new Set();    // 파일을 다 받아 끊김 없이 재생할 수 있는 패널
    const diverted = new Set(); // 막혀서 <img>로 넘긴 패널
    const imaged = new Set();   // <img>가 자리를 넘겨받아 움직이고 있는 패널

    const launch = () => {
      if (started || cancelled) return;
      started = true;
      clearTimeout(stillTimer);
      clearTimeout(giveUpTimer);
      ready.forEach((i) => {
        videos[i].currentTime = startAt;
        videos[i].play().catch(() => {});
      });
    };
    const maybeLaunch = () => {
      if (needsTouch || ready.size === 0) return;
      if (PANELS.every((_, i) => ready.has(i) || diverted.has(i))) launch();
    };
    // 무리가 먼저 출발한 뒤에 준비된 패널은 그 시각으로 끼어든다.
    const join = (i) => {
      const lead = videos.find((v, j) => j !== i && ready.has(j) && !v.paused);
      if (lead) videos[i].currentTime = lead.currentTime;
      videos[i].play().catch(() => {});
    };

    // 파일을 통째로 받아 메모리(blob)에서 재생한다. 스트리밍으로 틀면 받는 속도가
    // 재생을 못 따라가는 순간(인앱 브라우저, 약한 모바일 망) 패널마다 다른 자리에서
    // 멈춘다 — 다 받은 뒤에 틀면 재생 중에 끊길 일이 없고, 동기화의 위치 이동도 즉시 끝난다.
    // /asset은 하루 캐시라 다시 들어오면 받는 시간도 거의 없다.
    const load = async (i) => {
      if (loading.has(i)) return;
      loading.add(i);
      const v = videos[i];
      let src = sources[i];
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        src = blobUrls[i] = URL.createObjectURL(blob);
      } catch {
        if (cancelled) return; // 못 받았으면 스트리밍으로라도 튼다
      }
      // 터치로 이미 재생이 시작됐으면 갈아끼우지 않는다.
      if (!v.paused) return;
      // 준비 완료는 "파일이 메모리에 있다"로 본다. canplay를 기다리지 않는 이유 —
      // iOS는 재생을 걸기 전에는 데이터를 디코딩하지 않아 canplay가 안 올 수 있다.
      // 데이터가 이미 메모리에 있으니 셋이 같이 play()하면 거의 같이 출발한다.
      v.preload = 'auto';
      v.src = src;
      v.currentTime = needsTouch ? STILL_AT : startAt;
      ready.add(i);
      if (needsTouch) return;
      if (started) join(i);
      else maybeLaunch();
    };

    // 다 받기까지 오래 걸리면 빈 흰 화면 대신 정지 장면을 걸어두고 그 장면에서 출발한다.
    // 이미 받아둔 패널은 포스터 대신 영상 프레임이 보이므로 위치를 옮겨 같은 장면을 띄운다.
    const showStill = () => {
      if (started || cancelled) return;
      startAt = STILL_AT;
      videos.forEach((v, i) => {
        if (imaged.has(i)) return;
        v.poster = stillOf(i);
        if (v.readyState >= 1) v.currentTime = STILL_AT;
      });
    };
    const stillTimer = setTimeout(showStill, STILL_AFTER);
    const giveUpTimer = setTimeout(launch, START_GIVE_UP);

    // 터치 직후에만 재생되는 브라우저. play()는 반드시 이 핸들러 안에서 바로 불러야
    // 한다 — 한 틱이라도 미루면 사용자 터치로 인정받지 못한다. 셋이 같은 정지 장면에서
    // 같이 풀리므로 기다리지 않고 바로 출발한다(어긋나는 만큼은 아래 동기화가 맞춘다).
    // 미리 받아둔 패널은 메모리에서, 아직이면 스트리밍으로 돈다.
    // <img>로 넘어간 패널은 이미 움직이고 있으니 건드리지 않는다.
    let listening = false;
    const unlock = () => {
      if (!started) {
        started = true;
        clearTimeout(stillTimer);
        clearTimeout(giveUpTimer);
      }
      const waiting = videos.filter((_, i) => !imaged.has(i));
      waiting.forEach((v) => {
        if (v.paused) v.play().catch(() => {});
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

    // 막히면 같은 영상을 <img>로 받는다. <img>는 처음 그려지는 순간 움직이기
    // 시작하므로, 넘긴 패널이 전부 다 받을 때까지 숨겨뒀다가 한꺼번에 드러낸다.
    // <img>로도 안 되는 브라우저(크로뮴 계열)는 정지 장면을 걸어두고 터치를 기다리며,
    // 그동안 영상을 미리 받아둔다.
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
      img.onload = () => {
        if (cancelled) return;
        loaded.add(i);
        settled.add(i);
        reveal();
      };
      img.onerror = () => {
        if (cancelled) return;
        settled.add(i);
        needsTouch = true;
        startAt = STILL_AT;
        v.poster = stillOf(i);
        v.src = sources[i];
        v.currentTime = STILL_AT;
        listen();
        load(i);
        reveal();
      };
      img.src = imageSource(PANELS[i]);
    };

    // 재생이 허락되는지만 먼저 본다. 허락되면 play()를 부르는 순간 paused가 false가
    // 되므로, 데이터를 받기 전에 바로 알 수 있다(preload="none"이라 아직 아무것도 안
    // 받았다). 허락되면 곧바로 멈추고 소스를 걷어 스트리밍을 끊은 뒤 파일을 통째로
    // 받는다. 막히면 <img>로 넘긴다.
    const probe = (v, i) => {
      v.src = sources[i];
      const attempt = v.play();
      if (!v.paused) {
        attempt.catch(() => {});
        v.pause();
        v.removeAttribute('src');
        v.load();
        load(i);
        return;
      }
      attempt
        .then(() => {
          if (cancelled) return;
          v.pause();
          load(i);
        })
        .catch((err) => {
          if (cancelled) return;
          if (err?.name === 'NotAllowedError') {
            v.removeAttribute('src');
            v.load();
            toImage(v, i);
            maybeLaunch(); // 막힌 패널 때문에 나머지가 계속 기다리지 않게
          } else {
            load(i);
          }
        });
    };

    videos.forEach((v, i) => probe(v, i));

    // 가운데 패널을 기준으로 나머지를 맞춘다. 가운데가 멈춰 있거나 <img>로
    // 넘어갔으면 움직이고 있는 첫 패널이 기준이 된다.
    const sync = () => {
      if (!started) return;
      // 화면이 보이는데 멈춰 있는 패널은 다시 건다 — 인앱 브라우저에서 앱을 잠깐 나갔다
      // 오거나 OS가 재생을 끊었을 때 그대로 서 있지 않게. 터치를 기다리는 중이면 두고,
      // 다시 건 패널은 다음 차례에 아래 보정이 위치를 맞춘다.
      if (document.visibilityState === 'visible' && !listening) {
        videos.forEach((v, i) => {
          if (ready.has(i) && !imaged.has(i) && v.paused) v.play().catch(() => {});
        });
      }
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

    return () => {
      cancelled = true;
      clearTimeout(stillTimer);
      clearTimeout(giveUpTimer);
      clearInterval(syncTimer);
      blobUrls.forEach((url) => url && URL.revokeObjectURL(url));
      unlisten();
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
        {/* 영상을 누르면 그 장면의 가구로 간다 — 가운데(침대)는 10, 위·아래(스툴)는 11.
            영상 안의 사람·가구를 끌어 선택하지 않게 select-none, 우클릭 저장 메뉴 대신 링크 메뉴가 뜬다. */}
        <div className="flex w-full flex-col items-center gap-4 select-none md:flex-row md:gap-6">
          {PANELS.map((panel, i) => (
            <Link
              key={panel.key}
              href={panel.href}
              aria-label={panel.label}
              draggable={false}
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
                preload="none"
                disablePictureInPicture
                aria-hidden="true"
              />
              {/* 자동재생이 막혔을 때 영상 대신 띄우는 자리 — src는 이펙트가 그때 넣는다.
                  영상과 같은 이동·미러가 먹는다. next/image는 MP4를 못 다뤄서 일반 img를 쓴다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => {
                  imagesRef.current[i] = el;
                }}
                className={[
                  'absolute inset-0 block h-full w-full object-contain',
                  panel.shift ?? '',
                  panel.mirrored ? 'scale-x-[-1]' : '',
                ].join(' ')}
                alt=""
                aria-hidden="true"
                draggable={false}
                hidden
              />
            </Link>
          ))}
        </div>

        {/* 공개까지 남은 시간. 지나면 공개 날짜만 남는다. tracking은
            마지막 글자 뒤에도 자간을 붙여 글자 뭉치가 그만큼 왼쪽으로 쏠리므로, -0.25em으로
            꼬리를 걷어내야 잉크가 중앙에 온다. tabular-nums — 숫자 폭이 같아야
            초가 바뀔 때 줄이 좌우로 떨지 않는다. */}
        <p
          className="mr-[-0.25em] font-serif text-[11px] tracking-[0.25em] text-zinc-400 tabular-nums"
        >
          <Countdown />
        </p>
      </section>
    </div>
  );
}
