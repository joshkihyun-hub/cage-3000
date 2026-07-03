'use client';

import { useEffect, useRef, useState } from 'react';

// 커스텀 커서 — 가는 십자(+)가 링크·버튼 위에서 45° 회전해 ×로 변형된다.
// 네이티브 커서(cursor: url)는 상태 전환이 즉시 끊겨 애니메이션이 불가능하므로
// DOM 요소를 마우스에 붙여 CSS 트랜지션으로 변형한다. 스타일은 globals.css의
// #ui-cursor 블록에, 네이티브 커서 숨김은 <html>.has-custom-cursor 스코프에 —
// JS가 죽으면 클래스가 안 붙어 네이티브 커서가 그대로 남는다(안전장치).

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], summary, label, select, input[type="checkbox"], input[type="radio"]';
// 텍스트 입력 위에서는 십자를 숨기고 네이티브 I-beam을 쓴다.
const TEXT_FIELD_SELECTOR = 'input:not([type="checkbox"]):not([type="radio"]), textarea';

export default function UICursor() {
  const wrapRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const wrap = wrapRef.current;
    document.documentElement.classList.add('has-custom-cursor');

    const onMove = (e) => {
      wrap.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      wrap.classList.add('cursor-visible');
      const t = e.target instanceof Element ? e.target : null;
      const overText = !!(t && t.closest(TEXT_FIELD_SELECTOR));
      wrap.classList.toggle('cursor-hidden', overText);
      wrap.classList.toggle(
        'cursor-link',
        !overText && !!(t && t.closest(INTERACTIVE_SELECTOR))
      );
    };
    const onDown = () => wrap.classList.add('cursor-down');
    const onUp = () => wrap.classList.remove('cursor-down');
    const onLeave = () => wrap.classList.remove('cursor-visible');

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mousedown', onDown, { passive: true });
    document.addEventListener('mouseup', onUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div id="ui-cursor" ref={wrapRef} aria-hidden="true">
      <span className="cross" />
    </div>
  );
}
