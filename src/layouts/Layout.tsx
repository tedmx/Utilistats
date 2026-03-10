import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'

import { cn } from '../lib/utils'
import { dataService } from '../lib/dataService'
import { LayoutGrid } from 'lucide-react'
import { useAdmin } from '../hooks/useAdmin'
import { BackgroundAurora } from '@/components/BackgroundAurora'

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null)
  const isAdmin = useAdmin()

  useEffect(() => {
    // Получаем данные пользователя (из Supabase или Mock)
    dataService.getCurrentUser().then(setUser)
  }, [])

  const handleSignOut = async () => {
    await dataService.signOut()
    navigate('/login')
  }

  // Получаем инициалы для аватарки
  const getInitials = (email?: string) => {
    if (!email) return '??'
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <BackgroundAurora />
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
                  className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Объекты
                </Link>
              </nav>
            </div>

            {/* Профиль пользователя */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  {user?.email?.split('@')[0] || 'Пользователь'}
                </span>
                <span className="text-xs text-slate-500">{user?.email || 'Загрузка...'}</span>
              </div>

              <div className="group relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                  {getInitials(user?.email)}
                </div>

                {/* Выпадающее меню (простая реализация) */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Выйти из системы
                  </button>

                  {isAdmin && (
                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                      <p className="px-4 text-[10px] font-bold text-slate-400 uppercase mb-2">Администрирование</p>
                      <Link
                        to="/admin/categories"
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-xl transition-all"
                      >
                        <LayoutGrid className="w-5 h-5" />
                        Категории и тарифы
                      </Link>
                    </div>
                  )}
                </div>
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
