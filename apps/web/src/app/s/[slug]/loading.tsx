export default function Loading() {
  const bar = "rounded-lg bg-[var(--surface-2)] animate-pulse";
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6" aria-busy>
      <div className="flex items-center gap-4">
        <div className={`${bar} size-16`} />
        <div className="flex-1 space-y-2"><div className={`${bar} h-8 w-48`} /><div className={`${bar} h-4 w-72`} /></div>
        <div className={`${bar} size-16`} />
      </div>
      <div className={`${bar} mt-10 h-56`} />
      <div className={`${bar} mt-6 h-96`} />
    </div>
  );
}
