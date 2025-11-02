import type { ReactNode, SVGProps } from "react";

function createIcon(path: ReactNode, viewBox = "0 0 24 24") {
  return function Icon(props: SVGProps<SVGSVGElement>) {
    const { className, ...rest } = props;
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={viewBox}
        className={className}
        {...rest}
      >
        {path}
      </svg>
    );
  };
}

export const CloudArrowUpIcon = createIcon(
  <g stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 18a4.5 4.5 0 0 1-.4-8.99A5 5 0 0 1 17 8.5a4 4 0 0 1 1 7.88" />
    <path d="M12 14.5V7" />
    <path d="m8.75 10.25 3.25-3.25 3.25 3.25" />
  </g>
);

export const DocumentIcon = createIcon(
  <g stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3.75h5.25L18 8.5V20a.75.75 0 0 1-.75.75H8A2.25 2.25 0 0 1 5.75 18.5V6A2.25 2.25 0 0 1 8 3.75Z" />
    <path d="M13 3.75V8h4.25" />
    <path d="M9.75 12h4.5M9.75 15.25h4.5" />
  </g>
);

export const ArrowDownTrayIcon = createIcon(
  <g stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.75 17.25h10.5a1.5 1.5 0 0 0 1.5-1.5V14" />
    <path d="M4.5 14v1.75a1.5 1.5 0 0 0 1.5 1.5" />
    <path d="M12 6v8.25" />
    <path d="m8.75 11.75 3.25 3.25 3.25-3.25" />
  </g>
);

export const ChatBubbleLeftRightIcon = createIcon(
  <g stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.75 6h7.5A2.75 2.75 0 0 1 20 8.75v2.5A2.75 2.75 0 0 1 17.25 14H16l-2.5 2.5V14" />
    <path d="M14.25 14h-7.5A2.75 2.75 0 0 1 4 11.25v-2.5A2.75 2.75 0 0 1 6.75 6H8l2.5-2.5V6" />
  </g>
);

export const EnvelopeIcon = createIcon(
  <g stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.75 6.75h14.5a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75H4.75A.75.75 0 0 1 4 16.5v-9a.75.75 0 0 1 .75-.75Z" />
    <path d="m4 7 8 5 8-5" />
  </g>
);
