"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { UserAvatar } from "@/components/ui";

type NavUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
} | null;

export default function UserMenu({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!open) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex items-center justify-center focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserAvatar user={user} size={28} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-xl border border-white/15 bg-[#0d1117] shadow-xl text-sm text-white/90 overflow-hidden z-50"
        >
          <div className="px-3 py-3 flex items-center gap-3">
            <UserAvatar user={user} size={32} />
            <div className="font-semibold truncate">{user?.name || user?.email || "User"}</div>
          </div>
          <div className="border-t border-white/10" />

          <MenuItem icon={SmileIcon} label="Set status" />
          <MenuItem icon={UserIcon} label="Profile" href="/profile" />
          <MenuItem icon={RepoIcon} label="Repositories" href="/" />
          <MenuItem icon={GistIcon} label="Gists" href="/" />
          <MenuItem icon={OrgIcon} label="Organizations" href="/" />
          <MenuItem icon={GlobeIcon} label="Enterprises" href="/" />
          <MenuItem icon={HeartIcon} label="Sponsors" href="/" />

          <div className="my-1 border-t border-white/10" />

          <MenuItem icon={GearIcon} label="Settings" href="/settings" />
          <MenuItem icon={CopilotIcon} label="Copilot settings" href="/" />
          <MenuItem icon={FlaskIcon} label="Feature preview" href="/" />
          <MenuItem icon={PencilIcon} label="Appearance" href="/" />
          <MenuItem icon={AccessibilityIcon} label="Accessibility" href="/" />
          <MenuItem icon={UploadIcon} label="Try Enterprise" badge="Free" href="/" />

          <div className="my-1 border-t border-white/10" />

          <button
            role="menuitem"
            className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-3"
            onClick={() => signOut()}
          >
            <SignOutIcon className="size-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  href,
  badge,
}: {
  icon: (props: { className?: string }) => JSX.Element;
  label: string;
  href?: string;
  badge?: string;
}) {
  const content = (
    <div className="w-full px-3 py-2 hover:bg-white/10 flex items-center gap-3">
      <Icon className="size-4" />
      <span className="flex-1 truncate">{label}</span>
      {badge ? (
        <span className="text-xs text-white/80 border border-white/25 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      ) : null}
    </div>
  );
  if (href) {
    return (
      <a href={href} role="menuitem" className="block">
        {content}
      </a>
    );
  }
  return (
    <button type="button" role="menuitem" className="w-full text-left">
      {content}
    </button>
  );
}

// Icons
function SmileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM5.5 7a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm5 0A.75.75 0 1 1 10.5 5.5.75.75 0 0 1 10.5 7ZM8 11.25a3.75 3.75 0 0 1-3.2-1.75.75.75 0 1 1 1.25-.83 2.25 2.25 0 0 0 3.9 0 .75.75 0 1 1 1.25.83A3.75 3.75 0 0 1 8 11.25Z" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 1.75a3.25 3.25 0 1 1 0 6.5 3.25 3.25 0 0 1 0-6.5ZM2.75 13.5a5.25 5.25 0 0 1 10.5 0v.75H2.75Z" />
    </svg>
  );
}
function RepoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M2.75 1A1.75 1.75 0 0 0 1 2.75v10.5C1 14.216 1.784 15 2.75 15h10.5A1.75 1.75 0 0 0 15 13.25V2.75A1.75 1.75 0 0 0 13.25 1Zm.75 2.5h9v1.5h-9Zm0 3h9v1.5h-9Z" />
    </svg>
  );
}
function GistIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M2 2.75A.75.75 0 0 1 2.75 2h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H2.75A.75.75 0 0 1 2 13.25Zm4 2a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5Z" />
    </svg>
  );
}
function OrgIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M1.75 2h12.5v2H1.75Zm0 4h12.5v2H1.75Zm0 4h12.5v2H1.75Z" />
    </svg>
  );
}
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 1.5a5 5 0 0 1 4.7 3.25H8.75V3a5 5 0 0 1-.75 0Zm-5 5A5 5 0 0 1 7.25 3v3.75H3A5 5 0 0 1 3 8Zm1.3 3.25A5 5 0 0 1 8.75 8H13a5 5 0 0 1-8.7 3.25Z" />
    </svg>
  );
}
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 13.5S2.5 10 2.5 6.5A3 3 0 0 1 8 5a3 3 0 0 1 5.5 1.5C13.5 10 8 13.5 8 13.5Z" />
    </svg>
  );
}
function GearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M9.669 1.095a1 1 0 0 0-1.338 0l-.76.675a5.5 5.5 0 0 0-1.287.152l-.98-.47a1 1 0 0 0-1.32.493l-.5 1.118a5.5 5.5 0 0 0-.94.94l-1.118.5a1 1 0 0 0-.493 1.32l.47.98a5.5 5.5 0 0 0-.152 1.287l-.675.76a1 1 0 0 0 0 1.338l.675.76c.075.43.2.85.372 1.244l-.47.98a1 1 0 0 0 .493 1.32l1.118.5c.29.353.6.67.94.94l.5 1.118a1 1 0 0 0 1.32.493l.98-.47c.394.172.813.297 1.244.372l.76.675a1 1 0 0 0 1.338 0l.76-.675c.43-.075.85-.2 1.244-.372l.98.47a1 1 0 0 0 1.32-.493l.5-1.118c.353-.29.67-.6.94-.94l1.118-.5a1 1 0 0 0 .493-1.32l-.47-.98c.172-.394.297-.813.372-1.244l.675-.76a1 1 0 0 0 0-1.338l-.675-.76a5.5 5.5 0 1 0-7.34-7.34Z" />
    </svg>
  );
}
function CopilotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M4 2.5h8a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 12 10.5H4A2.5 2.5 0 0 1 1.5 8V5A2.5 2.5 0 0 1 4 2.5Z" />
    </svg>
  );
}
function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M6.5 1.75a.75.75 0 0 1 1.5 0V6l3.77 6.54A1.75 1.75 0 0 1 10.26 15H5.74a1.75 1.75 0 0 1-1.51-2.46L8 6Z" />
    </svg>
  );
}
function PencilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M11.013 1.427a1.5 1.5 0 0 1 2.121 2.121l-8.486 8.486a1 1 0 0 1-.47.263l-3 0.75 0.75-3a1 1 0 0 1 .263-.47Z" />
    </svg>
  );
}
function AccessibilityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM2.75 6.5a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5H9.75v6.25a.75.75 0 0 1-1.5 0V7.25H6.5v6.25a.75.75 0 0 1-1.5 0V7.25H3.5a.75.75 0 0 1-.75-.75Z" />
    </svg>
  );
}
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 1.5 3.5 6H6v5.5a.5.5 0 0 0 1 0V6h2.5L8 1.5ZM3 12.5a.5.5 0 0 0-.5.5v1A1 1 0 0 0 3.5 15h9a1 1 0 0 0 1-1v-1a.5.5 0 0 0-1 0v1h-9v-1a.5.5 0 0 0-.5-.5Z" />
    </svg>
  );
}
function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M6.75 2.75a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-5a.75.75 0 0 1-.75-.75V11a.75.75 0 0 1 1.5 0v1.5h3.5V3.5h-3.5V5a.75.75 0 0 1-1.5 0ZM2.47 8.53a.75.75 0 0 1 0-1.06l2-2a.75.75 0 1 1 1.06 1.06L4.81 7H8a.75.75 0 0 1 0 1.5H4.81l.72.72a.75.75 0 1 1-1.06 1.06Z" />
    </svg>
  );
}
