export default function Hero() {
  return (
    <section className="hero relative min-h-[50vh] flex items-center">
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight ink-drip">
          MYTHOS
        </h1>
        <p className="mt-4 max-w-2xl text-lg">
          Storytelling engines for AI. Spray the algorithm. Make noise, then measure it.
        </p>
        <div className="mt-8 flex gap-4">
          <a className="px-5 py-3 rounded bg-[color:var(--ink-black)] text-white" href="/composer">Launch Composer</a>
          <a className="px-5 py-3 rounded border border-[color:var(--ink-black)]" href="/projects">Open Projects</a>
        </div>
      </div>
      <svg className="absolute bottom-8 left-8 w-40 opacity-70" viewBox="0 0 200 60">
        <path d="M10 50 C60 20, 140 20, 190 50" stroke="black" strokeWidth="10" fill="none" />
      </svg>
    </section>
  );
}
