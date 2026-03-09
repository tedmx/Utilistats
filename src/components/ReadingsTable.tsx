import React from 'react'
import { TrashIcon } from 'lucide-react'

import { calculateDailyConsumption, cn, formatDate, getProjectedReading, getTariffForDate } from '@/lib/utils'

import type { Reading, Property, CounterType, CategoryTariff, PropertySettings } from '../types'

interface ReadingsTableProps {
  readings: Reading[]
  property: Property
  onEdit: (reading: Reading) => void
  onDelete: (id: string) => void
  counterLabels: Record<string, string>
  getHeatmapStyles: (diff: number, counter: string) => string
  categoryTariffs: CategoryTariff[],
  settings: PropertySettings
}

export function ReadingsTable({
  readings,
  property,
  onEdit,
  onDelete,
  counterLabels,
  getHeatmapStyles,
  categoryTariffs,
  settings,
}: ReadingsTableProps) {

  const subColsCount = settings.showDailyConsumption ? 4 : 3

  return (
    <div className='lg:col-span-3 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm'>
      <table className='w-full text-left border-collapse min-w-[600px] lg:min-w-[1000px]'>
        <thead className='bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700'>
          <tr>
            <th className='px-3 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700 max-w-[100px] text-center'>
              Период
            </th>
            {property.activeCounters
              .filter(counter => settings.visibleCounters.includes(counter as CounterType))
              .map((counter: CounterType) => (
                <th
                  key={counter}
                  colSpan={subColsCount}
                  className='px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase border-l border-slate-200 dark:border-slate-700'
                >
                  {counterLabels[counter] || counter}
                </th>
              ))
            }
            <th className='px-2 py-4'></th>
          </tr>
          <tr className='border-t border-slate-200 dark:border-slate-700'>
            <th className='px-4 py-2 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700 text-center'></th>
            {property.activeCounters
              .filter(counter => settings.visibleCounters.includes(counter as CounterType))
              .map((counter: CounterType) => (
                <React.Fragment key={`${counter}-sub`}>
                  <th className='px-2 py-2 text-[10px] font-bold text-slate-400 border-l border-slate-200 dark:border-slate-700 text-center'>
                    Тек.
                  </th>
                  <th className='px-2 py-2 text-[10px] font-bold text-slate-400  text-center'>Δ</th>
                  {settings.showDailyConsumption && (
                    <th className='px-2 py-2 text-[10px] font-bold text-blue-400 text-center italic  text-center'>Δ сут.</th>
                  )}
                  <th className='px-2 py-2 text-[10px] font-bold text-blue-500  text-center'>₽</th>
                </React.Fragment>
              ))
            }
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
          {/* Виртуальная строка прогноза */}
          <tr className='bg-blue-50/30 dark:bg-blue-900/10 italic'>
            <td className='px-2 py-4 text-sm font-medium sticky left-0 bg-blue-50 dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-700  max-w-[100px] text-center'>
              <div className='flex flex-col'>
                <span>{formatDate(new Date().toISOString())}</span>
                <span className='text-[10px] text-blue-500 font-bold not-italic'>ПРОГНОЗ</span>
              </div>
            </td>
            {property.activeCounters
              .filter(counter => settings.visibleCounters.includes(counter as CounterType))
              .map((counter: CounterType) => {
                const projection = getProjectedReading(readings, counter)
                const tariff = getTariffForDate(
                  categoryTariffs,
                  counter,
                  new Date().toISOString().split('T')[0]
                )
                const cost = projection ? Number(projection.delta) * tariff : 0
                return (
                  <React.Fragment key={`projected-${counter}`}>
                    <td className='px-2 py-4 text-sm border-l border-slate-100 dark:border-slate-800 opacity-60 text-center'>
                      {projection?.value || '—'}
                    </td>
                    <td className='px-2 py-4 text-sm opacity-60 text-center'>
                      {projection ? `+${projection.delta}` : '—'}
                    </td>
                    {settings.showDailyConsumption && (
                      <td className='px-2 py-4 text-sm border-l border-slate-100 dark:border-slate-800/30 text-center text-slate-400 font-medium italic'>
                        {'—'}
                      </td>
                    )}
                    <td className='px-2 py-4 text-sm font-bold text-blue-600/60 text-center'>
                      {cost > 0 ? `${cost.toFixed(2)}` : '—'}
                    </td>
                  </React.Fragment>
                )
              })}
          </tr>

          {readings.map((r, idx) => (
            <tr
              key={r.id}
              className='hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors'
            >
              <td
                className='px-2 py-4 text-[13px] font-bold whitespace-nowrap sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700 cursor-pointer group transition-colors max-w-[100px]'
                onClick={() => onEdit(r)}
              >
                <div className='flex flex-col justify-center min-h-[40px]'>
                  {/* Контейнер для даты — центрируем текст */}
                  <div className='flex items-center justify-center h-full'>
                    <span className='dark:text-white'>{formatDate(r.date)}</span>
                  </div>

                  {/* Контейнер для кнопки — абсолютно позиционируем под датой, чтобы не раздувать высоту */}
                  <div className='relative h-0 w-full flex justify-center'>
                    <span className='absolute top-1 text-[9px] font-black uppercase tracking-tighter text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white dark:bg-slate-800 px-1'>
                      изменить
                    </span>
                  </div>
                </div>
              </td>
              {property.activeCounters
                .filter(counter => settings.visibleCounters.includes(counter as CounterType))
                .map((counter: CounterType) => {
                  const currentVal = (r[counter as keyof Reading] as number) || 0
                  const prevReading = readings[idx - 1]
                  const prevVal = (prevReading?.[counter as keyof Reading] as number) || 0
                  const diff = idx === 0 ? 0 : currentVal - prevVal

                  // Считаем расход в день
                  const daily = (idx > 0 && prevReading)
                    ? calculateDailyConsumption(currentVal, prevVal, r.date, prevReading.date)
                    : 0

                  const tariff = getTariffForDate(categoryTariffs, counter, r.date)
                  const sum = diff * tariff

                  return (
                    <React.Fragment key={`${r.id}-${counter}`}>
                      <td
                        className={cn(
                          'px-2 py-4 text-sm border-l border-slate-100 dark:border-slate-800 text-center',
                          getHeatmapStyles(daily, counter)
                        )}
                      >
                        {currentVal}
                      </td>
                      <td
                        className={cn(
                          'px-2 py-2 text-sm border-l border-slate-100 dark:border-slate-800/50 text-center',
                          getHeatmapStyles(daily, counter)
                        )}
                      >
                        {diff > 0 ? `+${diff.toFixed(2)}` : '0'}
                      </td>
                      {settings.showDailyConsumption && (
                        <td
                          className={cn(
                            'px-2 py-4 text-sm border-l border-slate-100 dark:border-slate-800/30 text-center text-slate-400 font-medium italic',
                            getHeatmapStyles(daily, counter)
                          )}
                        >
                          {daily > 0 ? daily.toFixed(2) : '—'}
                        </td>
                      )}
                      <td
                        className={cn(
                          'px-2 py-4 text-sm font-bold text-slate-900 dark:text-white text-center',
                          getHeatmapStyles(daily, counter)
                        )}
                      >
                        {sum > 0 ? `${sum.toFixed(2)}` : '—'}
                      </td>
                    </React.Fragment>
                  )
                })}
              <td className='px-2 py-4 text-center'>
                <button
                  onClick={() => onDelete(r.id)}
                  className='p-2 text-slate-400 hover:text-red-500 transition-colors'
                >
                  <TrashIcon className='w-5 h-5' />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
