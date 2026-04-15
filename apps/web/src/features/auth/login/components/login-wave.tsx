type LoginWaveProps = {
  className?: string;
  flip?: boolean;
};

export function LoginWave({ className = "", flip = false }: LoginWaveProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 ${flip ? "bottom-0 rotate-180" : "top-0"} ${className}`}
    >
      <svg
        className="block h-28 w-full text-hearth-high/90 sm:h-32"
        preserveAspectRatio="none"
        viewBox="0 0 1200 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 28.2C95 52 190 59 285 55.5C379 52 474 38 568 24.8C663 11.8 758 -0.1 853 8.4C947 16.8 1042 45.8 1137 58.3C1190 65.3 1242 64.5 1200 64.5V0H0V28.2Z"
          fill="currentColor"
        />
        <path
          d="M0 49C100 73.8 200 80.3 300 75.9C400 71.5 500 56.4 600 42.1C700 27.8 800 14.2 900 21.3C1000 28.4 1100 56.2 1200 69.8V0H0V49Z"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
