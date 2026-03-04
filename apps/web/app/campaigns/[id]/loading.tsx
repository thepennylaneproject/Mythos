export default function CampaignLoading() {
  return (
    <main className="p-6 space-y-4">
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="h-8 w-64 bg-neutral-200 rounded" />
        <div className="h-4 w-40 bg-neutral-200 rounded" />
      </div>
      <div className="h-48 w-full max-w-3xl bg-neutral-100 rounded-xl animate-pulse" />
    </main>
  );
}
