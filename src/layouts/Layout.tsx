import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Шапка приложения */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип и Навигация */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-blue-700 transition-colors">
                  Ж
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900  dark:text-slate-400">ЖКХ Контроль</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link 
                  to="/" 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Объекты
                </Link>
                <span className="text-sm font-medium text-slate-500 hover:text-slate-900 cursor-not-allowed opacity-50">
                  Аналитика
                </span>
              </nav>
            </div>

            {/* Профиль пользователя (заглушка) */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-slate-900">Иван Иванов</span>
                <span className="text-xs text-slate-500">ivan@example.com</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-medium">
                ИИ
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Outlet — это то место, куда React Router вставит Dashboard или PropertyPage */}
        <Outlet />
      </main>

      {/* Подвал */}
      <footer className={cn(
        "border-t py-6 transition-colors",
        "border-slate-200 bg-white",           // Light mode
        "dark:border-slate-800 dark:bg-slate-900" // Dark mode
      )}>
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-400">
          © 2026 ЖКХ Контроль — Твой личный помощник в расчетах
        </div>
      </footer>
    </div>
  )
}
