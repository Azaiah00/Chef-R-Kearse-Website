/**
 * Portal icon set.
 *
 * Hand-drawn inline SVG on a 24-grid, 1.5 stroke, currentColor. No icon font,
 * no icon package, no network request, and no emoji anywhere in the product —
 * emoji render differently on every platform and cheapen a paid tool.
 *
 * Each icon is a bare <svg> with aria-hidden. The label always lives in the
 * surrounding element, so a screen reader hears the word, not the picture.
 */

type P = { className?: string };

const base = (className?: string) => ({
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: className ?? "h-[18px] w-[18px]",
});

export const IconGauge = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3.5 18a9 9 0 1 1 17 0" />
    <path d="m12 13.5 4-4" />
    <circle cx="12" cy="14" r="1.4" />
  </svg>
);

export const IconInbox = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3.5 13.5 6 5.5h12l2.5 8v5h-17v-5Z" />
    <path d="M3.5 13.5h4l1 2h7l1-2h4" />
  </svg>
);

export const IconUsers = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6.2a3 3 0 0 1 0 5.6" />
    <path d="M17.5 14.5a5.5 5.5 0 0 1 3 4.5" />
  </svg>
);

export const IconCalendar = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
  </svg>
);

export const IconMenuBook = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4 5.5h6.5a2 2 0 0 1 2 2v12a1.6 1.6 0 0 0-1.6-1.6H4Z" />
    <path d="M21 5.5h-6.5a2 2 0 0 0-2 2v12a1.6 1.6 0 0 1 1.6-1.6H21Z" />
  </svg>
);

export const IconMegaphone = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4 10.5v3l11 4.5V6L4 10.5Z" />
    <path d="M15 8.5a3.5 3.5 0 0 1 0 7" />
    <path d="M7 13v5a1.5 1.5 0 0 0 3 0v-3.8" />
  </svg>
);

export const IconChat = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M20.5 12c0 3.9-3.8 7-8.5 7a9.7 9.7 0 0 1-2.6-.35L4.5 20l1.2-3.1A6.6 6.6 0 0 1 3.5 12c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7Z" />
  </svg>
);

export const IconClipboard = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M9 4.5h6v2.5H9z" />
    <path d="M9 5.75H6.5a1 1 0 0 0-1 1V19.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V6.75a1 1 0 0 0-1-1H15" />
    <path d="M8.75 11.5h6.5M8.75 15h4.5" />
  </svg>
);

export const IconCart = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3 4.5h2l2.2 10.2a1.5 1.5 0 0 0 1.47 1.18h7.9a1.5 1.5 0 0 0 1.46-1.14L20 7.5H6" />
    <circle cx="9.5" cy="19.5" r="1.3" />
    <circle cx="17" cy="19.5" r="1.3" />
  </svg>
);

export const IconSettings = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="2.8" />
    <path d="M12 3.5v2.2M12 18.3v2.2M4.7 7.8l1.9 1.1M17.4 15.1l1.9 1.1M4.7 16.2l1.9-1.1M17.4 8.9l1.9-1.1" />
  </svg>
);

export const IconAlert = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 4.5 21 19.5H3L12 4.5Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="16.8" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);

export const IconCheck = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="m4.5 12.5 4.5 4.5 10.5-11" />
  </svg>
);

export const IconClock = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3.2 2" />
  </svg>
);

export const IconDownload = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 4v10" />
    <path d="m7.5 10 4.5 4.5L16.5 10" />
    <path d="M4.5 18.5h15" />
  </svg>
);

export const IconArrowRight = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4.5 12h14" />
    <path d="m13 6.5 5.5 5.5L13 17.5" />
  </svg>
);

export const IconMail = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.6 7 8.4 6 8.4-6" />
  </svg>
);

export const IconPhone = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M6.2 3.8h3l1.4 3.6-2 1.4a10.5 10.5 0 0 0 6.6 6.6l1.4-2 3.6 1.4v3a1.8 1.8 0 0 1-2 1.8A16.4 16.4 0 0 1 4.4 5.8a1.8 1.8 0 0 1 1.8-2Z" />
  </svg>
);

export const IconLock = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
);

export const IconFlame = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.3-4.3-5.9-3.6-11.4-2.6 1-4.2 3.3-4.2 5.6 0 1.4.6 2.3.6 3.1 0 1-.8 1.7-1.7 1.7-1.1 0-1.8-1-1.8-2.4C5.4 14 6 21 12 21Z" />
  </svg>
);

export const IconLogout = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M14.5 4.5h-8a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h8" />
    <path d="M12 12h9" />
    <path d="m17.5 8 3.5 4-3.5 4" />
  </svg>
);

export const IconSpark = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
  </svg>
);

export const IconChevron = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconPlus = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconTrash = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7" />
  </svg>
);
