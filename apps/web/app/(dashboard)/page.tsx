import PublishMonitor from "./components/PublishMonitor";
import InsightsMini from "./components/InsightsMini";
import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Welcome + Value Prop */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Mythos</h1>
        <p className="text-blue-100 mb-6 max-w-xl">
          Your AI storytelling agent. Create campaigns, schedule content, and grow your audience — all on autopilot.
        </p>
        <div className="flex gap-3">
          <Link 
            href="/composer"
            className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            ✨ Create with AI
          </Link>
          <Link 
            href="/campaigns"
            className="bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-white/30 transition"
          >
            View Campaigns
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InsightsMini label="Queued posts" value="8" trend="up" />
        <InsightsMini label="Published this week" value="14" trend="flat" />
        <InsightsMini label="Avg. engagement" value="3.2%" trend="down" />
      </div>

      <PublishMonitor />
    </main>
  );
}
