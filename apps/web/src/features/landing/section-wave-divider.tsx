type SectionWaveDividerProps = {
  accentColor?: string;
  className?: string;
  bottomColor: string;
  topColor: string;
};

export function SectionWaveDivider({
  accentColor = "rgba(255, 255, 255, 0.34)",
  className = "",
  bottomColor,
  topColor
}: SectionWaveDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none -mb-px -mt-px overflow-hidden leading-none ${className}`}
      style={{
        background: `linear-gradient(180deg, ${topColor} 0%, ${topColor} 38%, ${bottomColor} 100%)`
      }}
    >
      <svg
        className="wave-shadow block h-[5.5rem] w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="wave-layer wave-layer-back">
          <path
            d="M0 70C117 22 241 16 362 46C479 76 603 126 720 118C838 110 958 42 1078 38C1198 34 1321 92 1440 78V160H0V70Z"
            fill={topColor}
            opacity="0.92"
          />
        </g>
        <g className="wave-layer wave-layer-front">
          <path
            d="M0 88C118 132 238 132 359 102C478 72 598 18 720 28C840 38 959 112 1081 106C1201 100 1322 44 1440 52V160H0V88Z"
            fill={bottomColor}
          />
        </g>
        <g className="wave-layer wave-layer-highlight">
          <path
            d="M0 79C118 118 238 117 359 89C480 61 600 20 720 32C840 44 959 103 1081 98C1201 93 1322 43 1440 49"
            fill="none"
            opacity="0.8"
            stroke={accentColor}
            strokeLinecap="round"
            strokeWidth="5"
          />
        </g>
      </svg>
    </div>
  );
}
