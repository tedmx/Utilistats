export function BackgroundAurora() {
  return (
    // Добавили фиксированный контейнер, чтобы он не уезжал при скролле
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none  bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 bg-white dark:bg-slate-950 transition-colors duration-1000" />

      <div className="absolute inset-0 opacity-30 dark:opacity-60 transition-opacity duration-1000">
        {/* Синее свечение */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/30 mix-blend-plus-lighter blur-[120px] animate-aurora-slow" />

        {/* Зеленое свечение */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-500/20 mix-blend-plus-lighter blur-[100px] animate-aurora-medium" />

        {/* Бирюзовый акцент */}
        <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-400/20 mix-blend-plus-lighter blur-[130px] animate-aurora-fast" />
      </div>
    </div>
  )
}
