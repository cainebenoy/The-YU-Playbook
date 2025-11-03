import type { SVGProps } from "react";

export function YUltimateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
      <path d="M2 7l10 5" />
      <path d="M12 12v10" />
      <path d="M22 7l-10 5" />
      <path d="M6 9.5l-4 2" />
      <path d="M18 9.5l4 2" />
    </svg>
  );
}
