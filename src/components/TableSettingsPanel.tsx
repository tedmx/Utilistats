import { Settings2, Eye, CalendarDays, CheckCircle2, Loader2 } from 'lucide-react'
import { COUNTER_LABELS } from '../lib/constants'
import type { CounterType, PropertySettings } from '../types'
import { cn } from '../lib/utils'

interface TableSettingsPanelProps {
  activeCounters: CounterType[]
  settings: PropertySettings
  onSettingsChange: (newSettings: PropertySettings) => void
  isUpdating?: boolean
}

export function TableSettingsPanel({
  activeCounters,
  settings,
  onSettingsChange,
  isUpdating,
}: TableSettingsPanelProps) {

  const toggleCounter = (counter: CounterType) => {
    const newVisible = settings.visibleCounters.includes(counter)
      ? settings.visibleCounters.filter(c => c !== counter)
      : [...settings.visibleCounters, counter]

    onSettingsChange({ ...settings, visibleCounters: newVisible })
  }

  return (
    <div className='bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-6 relative overflow-hidden'>
      {/* Индикатор сохранения */}
      <div className='absolute top-4 right-6 flex items-center gap-2'>
        {isUpdating ? (
          <div className='flex items-center gap-1.5 text-blue-500 animate-pulse'>
            <Loader2 className='w-3.5 h-3.5 animate-spin' />
            <span className='text-[10px] font-bold uppercase tracking-widest'>Сохранение...</span>
          </div>
        ) : (
          <div className='flex items-center gap-1.5 text-emerald-500'>
            <CheckCircle2 className='w-3.5 h-3.5' />
            <span className='text-[10px] font-bold uppercase tracking-widest'>Сохранено</span>
          </div>
        )}
      </div>

      <div className='flex items-center gap-2 mb-4 text-slate-400'>
        <Settings2 className='w-4 h-4' />
        <span className='text-xs font-bold uppercase tracking-wider'>Настройки отображения</span>
      </div>

      <div className='flex flex-wrap gap-6'>
        {/* Выбор видимых счетчиков */}
        <div className='space-y-3'>
          <p className='text-sm font-medium text-slate-500 flex items-center gap-2'>
            <Eye className='w-4 h-4' /> Видимые счетчики
          </p>
          <div className='flex flex-wrap gap-2'>
            {activeCounters.map(counter => {
              const isActive = settings.visibleCounters.includes(counter)
              return (
                <button
                  key={counter}
                  disabled={isUpdating}
                  onClick={() => toggleCounter(counter)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm',
                    'cursor-pointer disabled:cursor-not-allowed', // Добавили указатель и запрещающий знак при загрузке
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'text-slate-400'
                  )}
                >
                  {COUNTER_LABELS[counter]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Дополнительные колонки */}
        <div className='space-y-3 border-l border-slate-100 dark:border-slate-800 pl-6'>
          <p className='text-sm font-medium text-slate-500 flex items-center gap-2'>
            <CalendarDays className='w-4 h-4' /> Аналитика
          </p>
          <label
            className='flex items-center gap-3 cursor-pointer group'
            onClick={() => onSettingsChange({ ...settings, showDailyConsumption: !settings.showDailyConsumption })}
          >
            <div
              className={cn(
                'w-10 h-6 rounded-full relative transition-colors',
                settings.showDailyConsumption ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
              )}
            >
              <div className={cn(
                'absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform',
                settings.showDailyConsumption && 'translate-x-4'
              )} />
            </div>
            <span className='text-xs font-bold text-slate-600 dark:text-slate-300'>Показывать расход в день</span>
          </label>
        </div>
      </div>
    </div>
  )
}
