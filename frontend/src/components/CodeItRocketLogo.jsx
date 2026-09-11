export default function CodeItRocketLogo({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="18" rx="4" className="fill-neutral-900/10 dark:fill-neutral-100/10 stroke-current" />
      <path d="M6 8l4 4-4 4" />
      <path d="M12 16h6" />
    </svg>
  );
}
