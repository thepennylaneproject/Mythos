import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PluginManager } from "@/components/PluginManager";

export default async function PluginsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Plugins</h1>
        <p className="text-muted-foreground mt-2">
          Connect Mythos to your favorite tools via webhooks and integrations.
        </p>
      </div>
      <PluginManager />
    </div>
  );
}
