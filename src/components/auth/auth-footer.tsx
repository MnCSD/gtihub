const authLinks = [
  { label: 'Terms', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Docs', href: '#' },
  { label: 'Contact GitHub Support', href: '#' },
  { label: 'Manage cookies', href: '#' },
  { label: 'Do not share my personal information', href: '#' },
];

const AuthFooter = () => {
  return (
    <footer className="h-14 border-t border-[#30363d] text-[#8b949e] text-sm flex items-center justify-center px-4">
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {authLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="hover:text-white transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
};

export default AuthFooter;