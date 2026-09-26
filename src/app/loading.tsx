export default function Loading() {
  return (
    <div
      className="dark-section flex min-h-[70svh] items-center justify-center"
      style={{ paddingTop: "var(--header-h)" }}
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <span className="t-label text-accent">Chef R. Kearse</span>
        <div className="mx-auto mt-5 h-px w-40 overflow-hidden bg-line-dark">
          <span className="block h-full w-1/3 animate-[slide_1.1s_ease-in-out_infinite] bg-accent" />
        </div>
        <span className="sr-only">Loading</span>
      </div>
      <style>{`@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  );
}
