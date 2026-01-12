export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#4F46E5" }} />
          <stop offset="100%" style={{ stopColor: "#7C3AED" }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="6" fill="url(#logo-bg)" />
      <path d="M16 6L6 11V13H26V11L16 6Z" fill="white" />
      <rect x="8" y="14" width="3" height="8" fill="white" />
      <rect x="14.5" y="14" width="3" height="8" fill="white" />
      <rect x="21" y="14" width="3" height="8" fill="white" />
      <rect x="6" y="23" width="20" height="3" fill="white" />
    </svg>
  );
}
