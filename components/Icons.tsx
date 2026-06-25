type IconProps = { className?: string; size?: number };
const def = (className?: string, size = 18) => ({
  className,
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function DashboardIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function UsersIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function PatientsIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

export function BlogIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function LogoutIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function ChevronDownIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ChevronUpIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export function ChevronLeftIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRightIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function SearchIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function PlusIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function EditIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function TrashIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function CheckIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function XIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function UserCheckIcon({ className, size }: IconProps) {
  return (
    <svg {...def(className, size)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}
