// 이 페이지는 클라이언트 컴포넌트라 metadata를 직접 낼 수 없다 — 탭 제목은 여기서 정한다
// (없으면 모든 탭이 홈 제목으로 떴다). 개인·결제 화면이라 검색에서 뺀다(robots.txt와 같은 범위).
export const metadata = {
  title: 'Register',
  robots: { index: false, follow: false },
  alternates: {},
};

export default function Layout({ children }) {
  return children;
}
