import React from 'react'
import { TrashIcon } from 'lucide-react'
import { cn, formatDate, getProjectedReading, getTariffForDate } from '../lib/utils'
import type { Reading, Property, CounterType, CategoryTariff } from '../types'

interface ReadingsTableProps {
  readings: Reading[]
  property: Property
  onEdit: (reading: Reading) => void
  onDelete: (id: string) => void
  counterLabels: Record<string, string>
  getHeatmapStyles: (diff: number, counter: string) => string
  categoryTariffs: CategoryTariff[]
}

export function ReadingsTable({
  readings,
  property,
  onEdit,
  onDelete,
  counterLabels,
  getHeatmapStyles,
  categoryTariffs,
}: ReadingsTableProps) {
  return (
    <div className='lg:col-span-3 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm'>
      <table className='w-full text-left border-collapse min-w-[1000px]'>
        <thead className='bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700'>
          <tr>
            <th className='px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700'>
              Период
            </th>
            {property.activeCounters.map((counter: CounterType) => (
              <th
                key={counter}
                colSpan={3}
                className='px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase border-l border-slate-200 dark:border-slate-700'
              >
                {counterLabels[counter] || counter}
              </th>
            ))}
            <th className='px-4 py-4'></th>
          </tr>
          <tr className='border-t border-slate-200 dark:border-slate-700'>
            <th className='px-6 py-2 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700'></th>
            {property.activeCounters.map((counter: CounterType) => (
              <React.Fragment key={`${counter}-sub`}>
                <th className='px-4 py-2 text-[10px] font-bold text-slate-400 border-l border-slate-200 dark:border-slate-700'>
                  Тек.
                </th>
                <th className='px-4 py-2 text-[10px] font-bold text-slate-400'>Δ</th>
                <th className='px-4 py-2 text-[10px] font-bold text-blue-500'>₽</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
          {/* Виртуальная строка прогноза */}
          <tr className='bg-blue-50/30 dark:bg-blue-900/10 italic'>
            <td className='px-6 py-4 text-sm font-medium sticky left-0 bg-blue-50 dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-700'>
              <div className='flex flex-col'>
                <span>{formatDate(new Date().toISOString())}</span>
                <span className='text-[10px] text-blue-500 font-bold not-italic'>ПРОГНОЗ</span>
              </div>
            </td>
            {property.activeCounters.map((counter: CounterType) => {
              const projection = getProjectedReading(readings, counter)
              const tariff = getTariffForDate(
                categoryTariffs,
                counter,
                new Date().toISOString().split('T')[0]
              )
              const cost = projection ? Number(projection.delta) * tariff : 0
              return (
                <React.Fragment key={`projected-${counter}`}>
                  <td className='px-4 py-4 text-sm border-l border-slate-100 dark:border-slate-800 opacity-60'>
                    {projection?.value || '—'}
                  </td>
                  <td className='px-4 py-4 text-sm opacity-60'>
                    {projection ? `+${projection.delta}` : '—'}
                  </td>
                  <td className='px-4 py-4 text-sm font-bold text-blue-600/60'>
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
                className='px-6 py-4 text-sm font-bold whitespace-nowrap sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700 cursor-pointer group transition-colors'
                onClick={() => onEdit(r)}
              >
                <div className='flex items-center gap-2'>
                  <span className='dark:text-white'>{formatDate(r.date)}</span>
                  <span className='text-[10px] font-medium transition-opacity opacity-0 group-hover:opacity-100 text-slate-400 dark:text-blue-400/80'>
                    ред.
                  </span>
                </div>
              </td>
              {property.activeCounters.map((counter: CounterType) => {
                const currentVal = (r[counter as keyof Reading] as number) || 0
                const prevVal = (readings[idx - 1]?.[counter as keyof Reading] as number) || 0
                const diff = idx === 0 ? 0 : currentVal - prevVal
                const tariff = getTariffForDate(categoryTariffs, counter, r.date)
                const sum = diff * tariff

                return (
                  <React.Fragment key={`${r.id}-${counter}`}>
                    <td className='px-4 py-4 text-sm border-l border-slate-100 dark:border-slate-800'>
                      {currentVal}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-4 text-sm border-l border-slate-100 dark:border-slate-800/50',
                        getHeatmapStyles(diff, counter)
                      )}
                    >
                      {diff > 0 ? `+${diff.toFixed(0)}` : '0'}
                    </td>
                    <td className='px-4 py-4 text-sm font-bold text-slate-900 dark:text-white'>
                      {sum > 0 ? `${sum.toFixed(2)}` : '—'}
                    </td>
                  </React.Fragment>
                )
              })}
              <td className='px-4 py-4 text-right'>
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
