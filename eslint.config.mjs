// eslint-config-next 16+ exports flat-config arrays directly —
// no FlatCompat wrapper needed (v16 dropped the legacy eslintrc format).
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      // 신규 자문성 규칙 — setHydrated 같은 표준 하이드레이션 게이트까지
      // 전부 걸려서(15곳+) 런칭 전 일괄 리팩터링 리스크가 더 크다.
      'react-hooks/set-state-in-effect': 'off',
      // 약관·개인정보처리방침의 한글 따옴표("…")를 HTML 엔티티로 강제하면
      // 법적 문구 편집이 번거로워진다. JSX에서 따옴표는 실질적 위험이 없다.
      'react/no-unescaped-entities': 'off',
    },
  },
];

export default eslintConfig;
