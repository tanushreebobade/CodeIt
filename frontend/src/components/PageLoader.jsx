// full-screen loader that follows the active theme (no flash of dark on light mode)
export default function PageLoader({ message = "Loading..." }) {
  return (
    <div
      className="min-h-dvh bg-[var(--bg-primary)] text-[var(--text-secondary)] flex flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <span className="loading loading-spinner loading-lg text-sky-500"></span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
