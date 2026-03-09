import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { dataService } from '@/lib/dataService'

function PropertyCardSkeleton() {
  return (
    <div className='p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 animate-pulse'>
      <div className='flex justify-between items-start mb-4'>
        {/* Иконка-заглушка */}
        <div className='w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg'></div>
      </div>

      {/* Заголовок-заглушка */}
      <div className='h-7 bg-slate-100 dark:bg-slate-700 rounded-md w-3/4 mb-2'></div>
      {/* Адрес-заглушка */}
      <div className='h-4 bg-slate-50 dark:bg-slate-800 rounded-md w-1/2'></div>

      <div className='mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center'>
        <div className='h-4 bg-slate-50 dark:bg-slate-800 rounded-md w-24'></div>
        <div className='h-4 bg-slate-100 dark:bg-slate-700 rounded-md w-16'></div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: dataService.getProperties
  })

  return (
    <div className='space-y-8'>
      {/* Приветствие и заголовок */}
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight dark:text-white'>Мои объекты</h1>
          <p className='text-slate-500 mt-2'>Управление недвижимостью и показаниями счетчиков</p>
        </div>
        <Link
          to='/property/new'
          className='flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20'
        >
          + Добавить объект
        </Link>
      </div>

      {/* Сетка объектов */}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {isLoading ? (
          // Показываем 3 скелетона во время загрузки
          <>
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </>
        ) : (
          <>
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className={cn(
                  'group p-6 rounded-2xl border transition-all shadow-sm', // Структура
                  'bg-white dark:bg-slate-800', // Цвета
                  'border-slate-200 dark:border-slate-700', // Границы
                  'hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1' // Эффекты
                )}
              >
                <div className='flex justify-between items-start mb-4'>
                  <div className='p-3 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors dark:bg-slate-900'>
                    <HomeIcon className='w-6 h-6 text-blue-600 group-hover:text-white transition-colors' />
                  </div>
                </div>

                <h2 className='text-xl font-bold text-slate-800 dark:text-white'>{property.name}</h2>
                <p className='text-slate-500 text-sm mt-1 line-clamp-1'>{property.address}</p>

                <div className='mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-sm'>
                  <span className='text-slate-400'>Последняя запись:</span>
                  <span className='font-medium text-slate-700 dark:text-slate-500'>12 фев. 2026</span>
                </div>
              </Link>
            ))}
            <Link
              to='/property/new'
              className='flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-slate-400 hover:text-blue-600 group'
            >
              <div className='p-3 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors'>
                <Plus className='w-6 h-6' />
              </div>
              <span className='font-bold'>Добавить объект</span>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

// Мини-иконка дома (Inline SVG для простоты)
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={2}
      stroke='currentColor'
      className={className}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'
      />
    </svg>
  )
}
