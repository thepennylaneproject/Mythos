"use client";

export default function ProjectsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">Could not load projects</h1>
      <p className="text-sm text-red-600">{error.message}</p>
      <button onClick={() => reset()} className="px-4 py-2 rounded-lg bg-black text-white">Try again</button>
    </main>
  );
}
