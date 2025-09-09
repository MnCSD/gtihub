export interface ChevronDownIconProps {
  size?: number;
  className?: string;
}

const ChevronDownIcon = ({ size = 20, className }: ChevronDownIconProps) => {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      width={size}
      height={size}
      aria-hidden
    >
      <path
        d="M5.25 7.75L10 12.5l4.75-4.75"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ChevronDownIcon;