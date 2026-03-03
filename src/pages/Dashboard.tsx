import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { dataService } from '../lib/dataService'
import { cn } from '../lib/utils'

import type { Property } from '../mocks/fixtures'

export function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    dataService.getProperties().then(setProperties)
  }, [])

  return (
    <div className='space-y-8'>
      {/* Приветствие и заголовок */}
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Мои объекты</h1>
          <p className='text-slate-500 mt-2'>Управление недвижимостью и показаниями счетчиков</p>
        </div>
        <button className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95'>
          + Добавить объект
        </button>
      </div>

      {/* Сетка объектов */}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {properties.map((property) => (
          <Link
            to={`/property/${property.id}`}
            className={cn(
              'group p-6 rounded-2xl border transition-all shadow-sm', // Структура
              'bg-white dark:bg-slate-800', // Цвета
              'border-slate-200 dark:border-slate-700', // Границы
              'hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5' // Эффекты
            )}
          >
            <div className='flex justify-between items-start mb-4'>
              <div className='p-3 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors  dark:bg-slate-900'>
                <HomeIcon className='w-6 h-6 text-blue-600 group-hover:text-white' />
              </div>
            </div>

            <h2 className='text-xl font-bold text-slate-800'>{property.name}</h2>
            <p className='text-slate-500 text-sm mt-1 line-clamp-1'>{property.address}</p>

            <div className='mt-6 pt-6 border-t border-slate-100 flex justify-between items-center text-sm'>
              <span className='text-slate-400'>Последняя запись:</span>
              <span className='font-medium text-slate-700  dark:text-slate-500'>12 фев. 2026</span>
            </div>
          </Link>
        ))}
        <Link
          to='/property/new'
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all'
        >
          <span>+ Добавить объект</span>
        </Link>
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
