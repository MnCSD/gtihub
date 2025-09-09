import Image from "next/image";

export interface UserAvatarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  size?: number;
  className?: string;
}

const UserAvatar = ({ user, size = 20, className = "" }: UserAvatarProps) => {
  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  if (user?.image) {
    return (
      <Image
        src={user.image}
        alt={user?.name || user?.email || "User"}
        width={size}
        height={size}
        className={`rounded-full border border-white/20 flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-white/10 text-white flex items-center justify-center border border-white/20 flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, size * 0.4), // Dynamic font size based on avatar size
      }}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
