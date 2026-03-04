import "./globals.css";
import { SessionProvider } from "@/components/auth/session-provider";
import { AppShell } from "@/components/AppShell";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Mythos | Storytelling Engine",
  description: "AI-driven marketing ops and campaign orchestration"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--wall-white)] text-[var(--ink-black)]">
        <SessionProvider session={session}>
          <AppShell>
            {children}
          </AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
