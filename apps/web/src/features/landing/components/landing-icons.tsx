export type IconProps = {
  className?: string;
};

export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16 16L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3C14.8 6 16.5 8.2 16.5 11.1C16.5 13.9 14.5 16 12 16C9.5 16 7.5 13.9 7.5 11.1C7.5 9.5 8 8 9.5 6.2C10.3 8 11.2 8.8 12 9.4C12.1 7.2 12.1 5.5 12 3Z"
        fill="currentColor"
      />
      <path
        d="M12 13.5C13.2 14.7 13.9 15.7 13.9 17C13.9 18.5 12.8 19.6 11.4 19.6C10 19.6 8.9 18.5 8.9 17C8.9 16.1 9.3 15.2 10.3 14.1C10.8 15.2 11.3 15.6 11.8 16C11.8 14.7 11.9 14 12 13.5Z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M13 6L19 12L13 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3L13.9 9.2L20 11L13.9 12.8L12 19L10.1 12.8L4 11L10.1 9.2L12 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <path
        d="M12 2.5V5.3M12 18.7V21.5M4.5 12H7.3M16.7 12H19.5M6.1 6.1L8.1 8.1M15.9 15.9L17.9 17.9M6.1 17.9L8.1 15.9M15.9 8.1L17.9 6.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function TimerIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.5 2.9H14.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M12 13L15 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function CutleryIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 3V11M5 11C6.2 11 7 10.2 7 9V3M5 11V21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M11 3V10C11 11.7 12 12.6 13.5 12.6H15V21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M16.5 3V21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12.5L9.2 16.8L19 6.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.7 14.9C15.9 15.4 14.9 15.7 13.9 15.7C10.9 15.7 8.5 13.3 8.5 10.3C8.5 8.1 9.8 6.2 11.7 5.4C10.9 5.2 10.1 5.1 9.2 5.1C5.4 5.1 2.3 8.2 2.3 12C2.3 15.8 5.4 18.9 9.2 18.9C12.4 18.9 15.1 16.8 16.7 14.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}
