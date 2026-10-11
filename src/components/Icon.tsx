const paths = {
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  training: 'M3 8v8 M6 5v14 M6 12h12 M18 5v14 M21 8v8',
  trend: 'M3 18l6-6 4 3 8-10 M15 5h6v6',
  profile: 'M20 21v-2a7 7 0 0 0-14 0v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  arrow: 'M4 12h16 M14 6l6 6-6 6',
  spark: 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
  logout: 'M9 4H4v16h5 M10 12h11 M16 7l5 5-5 5',
  check: 'M5 12l4 4L19 6',
  plus: 'M12 5v14 M5 12h14',
  weight: 'M5 20l2-12h10l2 12z M9 8V5a3 3 0 0 1 6 0v3',
  calendar: 'M5 3v4 M19 3v4 M3 10h18 M3 5h18v16H3z',
} as const;
export type IconName = keyof typeof paths;
export default function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
