import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--wall-white)] via-white to-[#fefbf5] text-[var(--ink-black)]">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          Mythos
        </Link>
        <Link href="/" className="text-sm text-[var(--brick-gray)] hover:text-[var(--ink-black)]">
          Back to homepage
        </Link>
      </header>
      <main className="px-6 pb-16">
        <div className="mx-auto w-full max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
