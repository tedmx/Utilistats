import React, { useMemo } from 'react'

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { readingSchema } from '../schemas/readingSchema'
import { MOCK_PROPERTIES, MOCK_READINGS } from '../mocks/data'

import type { ReadingFormValues } from '../schemas/readingSchema'
import { cn, getProjectedReading, getTariffForDate } from '../lib/utils'

type Reading = ReadingFormValues & { id: string }

const COUNTER_LABELS: Record<string, string> = {
  elec_t1: 'Электроэнергия T1',
  elec_t2: 'Электроэнергия T2',
  water_cold: 'ХВС (Холодная вода)',
  water_hot: 'ГВС (Горячая вода)',
  gas: 'Газ'
}
export function PropertyPage() {
  const { id } = useParams()
  const property = MOCK_PROPERTIES.find(p => p.id === id)
  
  // Создаем локальный стейт на базе моков
  const [readings, setReadings] = useState<Reading[]>(() => {
    // Берем данные из моков и приводим их к нашему типу
    const initialData = MOCK_READINGS[id as keyof typeof MOCK_READINGS] || []
    return initialData as Reading[]
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema) as Resolver<ReadingFormValues>
  })

  const onSubmit = (data: ReadingFormValues) => {
    const newEntry = {
      id: crypto.randomUUID(),
      ...data
    }
    setReadings(prev => {
      const updated = [...prev, newEntry]
      return updated.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    })
    reset()
  }

  // Внутри компонента PropertyPage перед return
  const inputStyles = cn(
    "w-full px-4 py-2 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500",
    "border-slate-200 bg-white text-slate-900", // Light
    "dark:border-slate-700 dark:bg-slate-900 dark:text-white" // Dark
  )

  const counterStats = useMemo(() => {
    const result: Record<string, { min: number, max: number }> = {}
    if (!property) return result

    property.activeCounters.forEach(counter => {
      const deltas = readings.map((r, i) => {
        if (i === 0) return 0
        const curr = r[counter] || 0
        const prev = readings[i - 1][counter] || 0
        return curr - prev
      }).filter(d => d > 0) // Игнорируем нулевые дельты первой строки

      result[counter] = {
        min: Math.min(...deltas),
        max: Math.max(...deltas)
      }
    })
    return result
  }, [readings, property])

  const getHeatmapStyles = (currentDiff: number, counter: string) => {
    if (currentDiff <= 0) return ''
    
    const stats = counterStats[counter]
    if (!stats || stats.max === stats.min) return 'bg-blue-100/10'

    // Вычисляем относительное положение: 0 — это минимум, 1 — это максимум
    const ratio = (currentDiff - stats.min) / (stats.max - stats.min)
    
    let bgClass = ''
    let textClass = 'text-slate-900 dark:text-slate-100'

    if (ratio > 0.85) {
      bgClass = 'bg-orange-500/60 dark:bg-orange-600/60' // Самый большой расход (140)
      textClass = 'text-orange-950 dark:text-white font-black'
    } else if (ratio > 0.7) {
      bgClass = 'bg-orange-400/40 dark:bg-orange-500/40'
    } else if (ratio > 0.55) {
      bgClass = 'bg-yellow-400/40 dark:bg-yellow-500/40' // Среднее (130)
    } else if (ratio > 0.4) {
      bgClass = 'bg-yellow-300/30 dark:bg-yellow-500/25'
    } else if (ratio > 0.25) {
      bgClass = 'bg-blue-300/20 dark:bg-blue-500/20'
    } else if (ratio > 0.1) {
      bgClass = 'bg-blue-200/15 dark:bg-blue-500/10'
    } else {
      bgClass = 'bg-blue-100/10 dark:bg-blue-500/5' // Самый маленький расход (120)
    }

    return cn(bgClass, textClass)
  }

  if (!property) return <div className="p-8 text-center">Объект не найден</div>

  return (
    <div className="space-y-8">
      {/* Шапка страницы объекта */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{property.name}</h1>
          <p className="text-slate-500">{property.address}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Форма добавления */}
        <div className="lg:col-span-1">
          <div className={cn(
            "p-6 rounded-3xl border shadow-sm sticky top-24 transition-colors",
            "bg-white border-slate-200", 
            "dark:bg-slate-800 dark:border-slate-700"
          )}>
            <h2 className="text-xl font-bold mb-6">Новые показания</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-500 mb-1">Дата</label>
                <input type="date" {...register('date')} className={inputStyles} />
              </div>

              {/* Динамические поля на основе активных счетчиков объекта */}
              {property.activeCounters.map(counter => (
                <div key={counter}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-500 mb-1">
                    {COUNTER_LABELS[counter]}
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    {...register(counter)}
                    placeholder="0.00"
                    className={inputStyles}
                  />
                  {errors[counter] && (
                    <p className="text-red-500 text-xs mt-1">Ошибка в значении</p>
                  )}
                </div>
              ))}

              <button className={cn(
                "w-full py-3 rounded-xl font-bold transition-all active:scale-[0.98] mt-4",
                "bg-slate-900 text-white hover:bg-slate-800",
                "dark:bg-blue-600 dark:hover:bg-blue-500"
              )}>
                Сохранить запись
              </button>
            </form>
          </div>
        </div>

        {/* Список показаний */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold dark:text-white">История потребления</h2>
          {readings.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400">
              Пока нет ни одной записи
            </div>
          ) : (
            <div className="lg:col-span-3 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  {/* Первый уровень заголовков: Ресурсы */}
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">Период</th>
                    {property.activeCounters.map(counter => (
                      <th key={counter} colSpan={3} className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase border-l border-slate-200 dark:border-slate-700">
                        {counter.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                  {/* Второй уровень: Типы данных */}
                  <tr className="border-t border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-2 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700"></th>
                    {property.activeCounters.map(counter => (
                      <React.Fragment key={`${counter}-sub`}>
                        <th className="px-4 py-2 text-[10px] font-bold text-slate-400 border-l border-slate-200 dark:border-slate-700">Тек.</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-slate-400">Δ</th>
                        <th className="px-4 py-2 text-[10px] font-bold text-blue-500">₽</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Виртуальная строка прогноза */}
                  <tr className="bg-blue-50/30 dark:bg-blue-900/10 italic">
                    <td className="px-6 py-4 text-sm font-medium sticky left-0 bg-blue-50 dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex flex-col">
                        <span>{new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
                        <span className="text-[10px] text-blue-500 font-bold not-italic">ПРОГНОЗ НА СЕГОДНЯ</span>
                      </div>
                    </td>
                    {property.activeCounters.map(counter => {
                      const projection = getProjectedReading(readings, counter)
                      const tariff = getTariffForDate(counter, new Date().toISOString().split('T')[0])
                      const cost = projection ? Number(projection.delta) * tariff : 0

                      return (
                        <React.Fragment key={`projected-${counter}`}>
                          <td className="px-4 py-4 text-sm border-l border-slate-100 dark:border-slate-800 opacity-60">
                            {projection?.value || '—'}
                          </td>
                          <td className="px-4 py-4 text-sm opacity-60">
                            {projection ? `+${projection.delta}` : '—'}
                          </td>
                          <td className="px-4 py-4 text-sm font-bold text-blue-600/60">
                            {cost > 0 ? `${cost.toFixed(2)}` : '—'}
                          </td>
                        </React.Fragment>
                      )
                    })}
                  </tr>

                  {readings.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold whitespace-nowrap sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">
                        {new Date(r.date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                      </td>
                      {property.activeCounters.map(counter => {
                        const currentVal = r[counter] || 0
                        const prevVal = readings[idx - 1]?.[counter] || 0
                        const diff = idx === 0 ? 0 : currentVal - prevVal
                        const tariff = getTariffForDate(counter, r.date)
                        const sum = diff * tariff

                        return (
                          <React.Fragment key={`${r.id}-${counter}`}>
                            <td className="px-4 py-4 text-sm border-l border-slate-100 dark:border-slate-800">{currentVal}</td>
                            <td className={cn(
                              "px-4 py-4 text-sm transition-all duration-500 border-l border-slate-100 dark:border-slate-800/50",
                              getHeatmapStyles(diff, counter) // Наша подсветка
                            )}>
                              <div className="flex flex-col">
                                <span className="text-base">
                                  {diff > 0 ? `+${diff.toFixed(0)}` : '0'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm font-bold text-slate-900 dark:text-white">
                              {sum > 0 ? `${sum.toFixed(2)}` : '—'}
                            </td>
                          </React.Fragment>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
