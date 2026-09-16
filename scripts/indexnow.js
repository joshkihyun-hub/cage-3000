// IndexNow — 새 페이지·변경된 페이지를 Bing과 네이버에 즉시 알린다.
// ChatGPT·Copilot의 웹 검색은 Bing 인덱스를 쓰므로, 여기에 빨리 들어가는 것이
// AI 어시스턴트가 브랜드를 찾아낼 확률을 높이는 가장 직접적인 경로다.
//
// 사용법: 배포가 끝난 뒤 `npm run indexnow`
// 키 파일: public/5ae76000fbab8de7d5bb01ad2c80777f.txt (https://cage3000.com/5ae76000fbab8de7d5bb01ad2c80777f.txt 로 확인 가능)

const KEY = '5ae76000fbab8de7d5bb01ad2c80777f';
const HOST = 'cage3000.com';
const SITEMAP = `https://${HOST}/sitemap.xml`;

async function main() {
  const xml = await fetch(SITEMAP).then((res) => {
    if (!res.ok) throw new Error(`사이트맵을 읽지 못했습니다 (${res.status})`);
    return res.text();
  });

  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (urlList.length === 0) throw new Error('사이트맵에서 주소를 찾지 못했습니다.');

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  });

  // 200/202 모두 정상 접수. 검색엔진이 언제 수집할지는 각자 판단한다.
  console.log(`IndexNow 응답: ${res.status} ${res.statusText} — 주소 ${urlList.length}개 제출`);
  if (!res.ok) console.log(await res.text());
}

main().catch((error) => {
  console.error('IndexNow 실패:', error.message);
  process.exit(1);
});
