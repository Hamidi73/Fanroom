import Link from "next/link";

// Wordmark: a purple rounded "play" mark + the FanRoom name. Clean, not condensed.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 no-underline ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
        <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 1.6v8.8a.6.6 0 0 0 .92.5l7-4.4a.6.6 0 0 0 0-1l-7-4.4a.6.6 0 0 0-.92.5Z" fill="#fff" />
        </svg>
      </span>
      <span className="text-[17px] font-extrabold tracking-tight text-ink-foreground">
        FanRoom
      </span>
    </Link>
  );
}
