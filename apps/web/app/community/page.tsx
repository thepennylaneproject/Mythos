import { db } from "@/lib/db";
import { organizations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CommunityDashboard } from "@/components/CommunityDashboard";

export default async function CommunityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Community CRM</h1>
        <p className="text-muted-foreground mt-2">
          Track your superfans and build lasting relationships.
        </p>
      </div>
      <CommunityDashboard />
    </div>
  );
}
