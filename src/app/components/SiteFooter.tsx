// Shared compliance footer. Same reminder on every page that uses it.

// Social links. hrefs are placeholders for now — drop in the real profile URLs
// once we have them (just replace the "#").
const socials = [
  {
    name: "X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zm0 1.802c-3.15 0-3.522.012-4.764.069-1.024.047-1.58.218-1.95.362-.49.19-.84.418-1.207.785-.367.367-.595.717-.785 1.207-.144.37-.315.926-.362 1.95-.057 1.242-.069 1.614-.069 4.764s.012 3.522.069 4.764c.047 1.024.218 1.58.362 1.95.19.49.418.84.785 1.207.367.367.717.595 1.207.785.37.144.926.315 1.95.362 1.242.057 1.614.069 4.764.069s3.522-.012 4.764-.069c1.024-.047 1.58-.218 1.95-.362.49-.19.84-.418 1.207-.785.367-.367.595-.717.785-1.207.144-.37.315-.926.362-1.95.057-1.242.069-1.614.069-4.764s-.012-3.522-.069-4.764c-.047-1.024-.218-1.58-.362-1.95-.19-.49-.418-.84-.785-1.207-.367-.367-.717-.595-1.207-.785-.37-.144-.926-.315-1.95-.362-1.242-.057-1.614-.069-4.764-.069zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
      </svg>
    ),
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/10 px-5 py-10 text-center text-xs text-muted">
      <div className="mb-4 flex items-center justify-center gap-5">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            aria-label={s.name}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition hover:text-accent-soft"
          >
            {s.icon}
          </a>
        ))}
      </div>
      Reminder: rooms are for reactions, commentary &amp; community — never match
      footage. · FanRoom Global
    </footer>
  );
}
