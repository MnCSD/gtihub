import Image from 'next/image';

export interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

const Logo = ({ size = 30, className, showText = false }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/github-mark-white.png"
        alt="GitHub Logo"
        width={size}
        height={size}
        priority
      />
      {showText && <span className="font-semibold text-white">GitHub</span>}
    </div>
  );
};

export default Logo;