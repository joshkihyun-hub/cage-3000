'use client';

import { useEffect, useRef, useState } from 'react';

// 공유 버튼 — 휴대폰에서는 OS 공유 시트(카카오톡·인스타그램 DM·메시지)를 열고,
// 데스크탑에서는 링크를 복사한다. 복사되면 Add to Bag처럼 라벨이 잠시 바뀐다.
export function ShareButton({ title, className = '' }) {
    const [copied, setCopied] = useState(false);
    const copiedTimer = useRef(null);

    useEffect(() => () => clearTimeout(copiedTimer.current), []);

    const handleShare = async () => {
        // 쿼리·해시 없는 정식 주소를 공유 — 공유 카드와 검색 집계가 한 URL로 모인다.
        const url = `${window.location.origin}${window.location.pathname}`;
        const isTouch = window.matchMedia('(pointer: coarse)').matches;

        if (isTouch && navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch {
                // 사용자가 공유 시트를 닫은 경우 — 할 일 없음.
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            clearTimeout(copiedTimer.current);
            copiedTimer.current = setTimeout(() => setCopied(false), 1600);
        } catch {
            window.prompt('Copy link', url);
        }
    };

    return (
        <button type="button" onClick={handleShare} className={className}>
            {copied ? 'Link Copied ✓' : 'Share →'}
        </button>
    );
}
