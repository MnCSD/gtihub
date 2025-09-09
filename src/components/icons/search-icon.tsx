export interface SearchIconProps {
  size?: number;
  className?: string;
}

const SearchIcon = ({ size = 24, className }: SearchIconProps) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width={size}
      height={size}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
};

export default SearchIcon;