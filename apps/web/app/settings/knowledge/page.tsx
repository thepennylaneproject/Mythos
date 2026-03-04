import { db } from "@/lib/db";
import { brandKnowledge, organizations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AddKnowledgeForm } from "./AddKnowledgeForm";

export default async function KnowledgeBasePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // For MVP, we'll assume the user belongs to one org or we fetch the first one
  const [userOrg] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.ownerId, session.user.id!));

  if (!userOrg) {
    return <div>Please create an organization first.</div>;
  }

  const knowledgeItems = await db
    .select()
    .from(brandKnowledge)
    .where(eq(brandKnowledge.orgId, userOrg.id));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Manage the intelligence that powers your autonomous storyteller.
          </p>
        </div>
        <AddKnowledgeForm orgId={userOrg.id} />
      </div>

      <div className="grid gap-6">
        {knowledgeItems.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-12 text-center">
            <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-semibold">No knowledge base pieces yet</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
              Upload style guides, tone documents, or past successful campaigns to train your agent.
            </p>
          </div>
        ) : (
          knowledgeItems.map((item) => (
            <div key={item.id} className="border rounded-xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded uppercase">
                      {item.metadata?.type || "General"}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${item.vectorId ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.vectorId ? 'Indexed' : 'Pending Index'}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2 text-foreground/80">
                    {item.content}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Source: {item.metadata?.source || "Manual Entry"}</span>
                    <span>Added {new Date(item.createdAt!).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
