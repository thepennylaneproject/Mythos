export default function LoadingProjects() {
  return (
    <main className="p-6 space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-neutral-200 rounded" />
      <div className="h-12 w-full max-w-xl bg-neutral-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 bg-neutral-200 rounded-xl" />
        <div className="h-32 bg-neutral-200 rounded-xl" />
      </div>
    </main>
  );
}
