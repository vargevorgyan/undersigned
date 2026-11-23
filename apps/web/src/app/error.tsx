"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl">Something went wrong</h1>
      <p className="mt-2 muted">It's not you, it's us. Please try again.</p>
      <button onClick={reset} className="btn btn-primary mt-6">Try again</button>
    </div>
  );
}
