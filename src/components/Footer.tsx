export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0B0F17] pt-6 pb-20 sm:pb-16">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 px-4 text-center text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <p>
          <span className="font-mono font-semibold text-slate-200">DubIoT</span> · Monitoreo IoT para hoteles y edificios ·{' '}
          <a
            href="https://wa.me/5491164824115"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-slate-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-emerald-400 hover:decoration-emerald-400/50"
          >
            WhatsApp +54 9 11 6482-4115
          </a>
        </p>
        <p className="text-slate-500">Demo interactiva en tiempo real</p>
      </div>
    </footer>
  );
}
