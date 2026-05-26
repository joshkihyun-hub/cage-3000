'use client';

// Hand-drawn icon set for CAGE3000 — designed to live alongside the
// sketched bird logo. All icons share:
//   - 24×24 viewBox
//   - currentColor stroke (so Tailwind text-color utilities work)
//   - rounded caps/joins, thin 1.3 stroke (override per icon via strokeWidth prop)
//   - intentionally imperfect curves so they read as drawn-by-hand rather
//     than as a clean utility icon set.
//
// Sizing: pass any Tailwind size class (e.g. className="w-5 h-5").

function Icon({ children, strokeWidth = 1.3, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconBag(props) {
  return (
    <Icon {...props}>
      {/* bag body — slightly trapezoidal & wonky */}
      <path d="M5.4 8.5 C 8 8.1 16 8.1 18.7 8.5 C 19 12.5 19.1 16.6 18.8 19.6 C 14 20 8 20 5.2 19.5 C 4.9 16.4 4.9 11.4 5.4 8.5 Z" />
      {/* handle — asymmetric arch */}
      <path d="M8.3 8.3 C 8 6 9 4.4 12 4.3 C 15.2 4.5 16 6 15.7 8.3" />
      {/* tiny smile so it reads as the bag from the brand */}
      <path d="M10.6 12.6 C 11.4 13.3 12.5 13.3 13.4 12.5" />
    </Icon>
  );
}

export function IconUser(props) {
  return (
    <Icon {...props}>
      <path d="M8.5 8.6 C 8.4 6 10 4.4 12 4.5 C 14.1 4.6 15.6 6.1 15.5 8.7 C 15.4 10.9 14 12.2 12 12.2 C 10 12.2 8.6 10.9 8.5 8.6 Z" />
      <path d="M4.6 19.8 C 5.1 17.3 7.6 15.5 12 15.4 C 16.5 15.5 18.9 17.3 19.5 19.8" />
    </Icon>
  );
}

export function IconLogIn(props) {
  return (
    <Icon {...props}>
      {/* doorway frame on the right */}
      <path d="M13 4.4 C 16 4.4 19 4.5 20 4.5 C 20.1 9 20.1 15 20 19.5 C 19 19.6 16 19.7 13 19.6" />
      {/* arrow shaft */}
      <path d="M3.5 12 C 6.5 12 11 11.9 15 12.1" />
      {/* arrow head */}
      <path d="M11.6 8.6 C 12.5 9.7 13.9 11 14.9 12.1 C 13.9 13.1 12.4 14.6 11.5 15.6" />
    </Icon>
  );
}

export function IconLogOut(props) {
  return (
    <Icon {...props}>
      <path d="M11 4.4 C 8 4.4 5 4.5 4 4.5 C 3.9 9 3.9 15 4 19.5 C 5 19.6 8 19.7 11 19.6" />
      <path d="M9 12 C 12 12 17 11.9 21 12.1" />
      <path d="M17.5 8.6 C 18.4 9.7 19.9 11 20.9 12.1 C 19.9 13.1 18.4 14.6 17.5 15.6" />
    </Icon>
  );
}

export function IconShield(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 C 9 4.4 6 5 4.6 5.5 C 4.5 11.5 6.8 17.5 12 20.5 C 17.2 17.5 19.5 11.5 19.4 5.5 C 18 5 15 4.4 12 3.5 Z" />
      <path d="M9 11.5 C 10.3 12.9 11.4 13.9 12.4 14.7 C 13.7 12.9 14.7 10.9 15.5 9.6" />
    </Icon>
  );
}

export function IconMenu(props) {
  return (
    <Icon {...props}>
      <path d="M4 7.2 C 8 7 16 7 20 7.3" />
      <path d="M4 12.1 C 8 12 16 12 20 12.2" />
      <path d="M4 17 C 8 16.9 16 16.9 20 17.1" />
    </Icon>
  );
}

export function IconClose(props) {
  return (
    <Icon {...props}>
      <path d="M6 6 C 9 9.5 14 14.5 18 18.2" />
      <path d="M18 6 C 14.5 9.5 9.5 14.5 6 18.2" />
    </Icon>
  );
}

export function IconChevronDown(props) {
  return (
    <Icon strokeWidth={1.4} {...props}>
      <path d="M6 9.5 C 8 11 10.5 13.4 12 14.2 C 13.5 13.4 16 11 18 9.5" />
    </Icon>
  );
}
