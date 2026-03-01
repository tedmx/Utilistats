import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TrashIcon } from 'lucide-react'

import { Modal } from '../components/ui/Modal'
import { supabase } from '../lib/supabase'
import { cn, formatDate, getProjectedReading, getTariffForDate } from '../lib/utils'
import { dataService } from '../lib/dataService'
import { readingSchema } from '../schemas/readingSchema'

import type { ReadingFormValues } from '../schemas/readingSchema'
import type { CounterType, Property } from '../mocks/fixtures'
import type { Resolver } from 'react-hook-form'

type Reading = ReadingFormValues & { id: string }

const COUNTER_LABELS: Record<string, string> = {
  elec_t1: 'Электроэнергия T1',
  elec_t2: 'Электроэнергия T2',
  water_cold: 'ХВС (Холодная вода)',
  water_hot: 'ГВС (Горячая вода)',
  gas: 'Газ',
}
export function PropertyPage() {
  const { id } = useParams()
  const [isSaving, setIsSaving] = useState(false)

  const [properties, setProperties] = useState<Property[]>([])
  const property = useMemo(() => properties.find((p) => p.id === id), [properties, id])

  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)

  const [editingReading, setEditingReading] = useState<Reading | null>(null)
  const [readingToDelete, setReadingToDelete] = useState<string | null>(null)

  useEffect(() => {
    const initPage = async () => {
      if (!id) return
      setLoading(true)
      try {
        // Загружаем всё параллельно для скорости
        const [props] = await Promise.all([
          dataService.getProperties(),
          // fetchReadings логику можно вынести в dataService или оставить здесь
        ])
        setProperties(props)

        const readingsData = await dataService.getReadings(id)
        setReadings(readingsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    initPage()
  }, [id])

  useEffect(() => {
    const fetchReadings = async () => {
      if (!id) return

      setLoading(true)
      const { data, error } = await supabase
        .from('readings')
        .select('*')
        .eq('property_id', id)
        .order('date', { ascending: true }) // Важно для расчета Δ

      if (error) {
        console.error('Ошибка загрузки:', error.message)
      } else {
        setReadings(data || [])
      }
      setLoading(false)
    }

    fetchReadings()
  }, [id])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema) as Resolver<ReadingFormValues>,
  })

  const onSubmit = async (data: ReadingFormValues) => {
    if (!id) return
    setIsSaving(true)

    try {
      const newEntry = {
        ...data,
        property_id: id,
        // Supabase сам создаст id (uuid), если настроено в таблице
      }

      const { data: insertedData, error } = await supabase
        .from('readings')
        .insert([newEntry])
        .select()

      if (error) throw error

      if (insertedData) {
        setReadings((prev) => {
          const updated = [...prev, insertedData[0]]
          return updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        })
        reset()
      }
    } catch (error) {
      if (error instanceof Error) {
        // Теперь TS знает, что у err есть свойство message
        alert('Ошибка сохранения: ' + error.message)
      } else {
        // На случай, если выброшено что-то странное (не объект Error)
        alert('Произошла неизвестная ошибка')
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Внутри компонента PropertyPage перед return
  const inputStyles = cn(
    'w-full px-4 py-2 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500',
    'border-slate-200 bg-white text-slate-900', // Light
    'dark:border-slate-700 dark:bg-slate-900 dark:text-white' // Dark
  )

  const counterStats = useMemo(() => {
    const result: Record<string, { min: number; max: number }> = {}
    if (!property) return result

    property.activeCounters.forEach((counter: CounterType) => {
      const deltas = readings
        .map((r, i) => {
          if (i === 0) return 0
          const curr = r[counter] || 0
          const prev = readings[i - 1][counter] || 0
          return curr - prev
        })
        .filter((d) => d > 0)

      if (deltas.length > 0) {
        result[counter] = {
          min: Math.min(...deltas),
          max: Math.max(...deltas),
        }
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

  // Функция обновления
  const handleUpdate = async (updatedData: Partial<Reading>) => {
    if (!editingReading) return
    try {
      const { error } = await supabase
        .from('readings')
        .update(updatedData)
        .eq('id', editingReading.id)

      if (error) throw error
      // Обновляем локальный стейт
      setReadings((prev) =>
        prev.map((r) => (r.id === editingReading.id ? { ...r, ...updatedData } : r))
      )
      setEditingReading(null)
    } catch (err) {
      alert('Ошибка при обновлении')
      console.error(err)
    }
  }

  // Функция удаления
  const handleDelete = async () => {
    if (!readingToDelete) return
    try {
      const { error } = await supabase.from('readings').delete().eq('id', readingToDelete)
      if (error) throw error
      setReadings((prev) => prev.filter((r) => r.id !== readingToDelete))
      setReadingToDelete(null)
    } catch (err) {
      alert('Ошибка при удалении')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
        <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
        <p className='text-slate-500 animate-pulse'>Загружаем данные из облака...</p>
      </div>
    )
  }

  if (!property) return <div className='p-8 text-center'>Объект не найден</div>

  return (
    <div className='space-y-8'>
      {/* Шапка страницы объекта */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-extrabold tracking-tight'>{property.name}</h1>
          <p className='text-slate-500'>{property.address}</p>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Форма добавления */}
        <div className='lg:col-span-1'>
          <div
            className={cn(
              'p-6 rounded-3xl border shadow-sm sticky top-24 transition-colors',
              'bg-white border-slate-200',
              'dark:bg-slate-800 dark:border-slate-700'
            )}
          >
            <h2 className='text-xl font-bold mb-6'>Новые показания</h2>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 dark:text-slate-500 mb-1'>
                  Дата
                </label>
                <input type='date' {...register('date')} className={inputStyles} />
              </div>

              {/* Динамические поля на основе активных счетчиков объекта */}
              {property.activeCounters.map((counter) => (
                <div key={counter}>
                  <label className='block text-sm font-medium text-slate-700 dark:text-slate-500 mb-1'>
                    {COUNTER_LABELS[counter]}
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    {...register(counter)}
                    placeholder='0.00'
                    className={inputStyles}
                  />
                  {errors[counter] && (
                    <p className='text-red-500 text-xs mt-1'>Ошибка в значении</p>
                  )}
                </div>
              ))}

              <button
                disabled={isSaving}
                className={cn(
                  'w-full py-3 rounded-xl font-bold transition-all active:scale-[0.98] mt-4 flex justify-center items-center',
                  'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed',
                  'dark:bg-blue-600 dark:hover:bg-blue-500'
                )}
              >
                {isSaving ? (
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                ) : (
                  'Сохранить запись'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Список показаний */}
        <div className='lg:col-span-2 space-y-4'>
          <h2 className='text-xl font-bold dark:text-white'>История потребления</h2>
          {loading ? (
            // Заглушка (Skeleton), пока данные подгружаются
            <div className='space-y-4 animate-pulse'>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className='h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full'
                />
              ))}
            </div>
          ) : readings.length === 0 ? (
            <div className='p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400'>
              Пока нет ни одной записи
            </div>
          ) : (
            <div className='lg:col-span-3 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm'>
              <table className='w-full text-left border-collapse min-w-[1000px]'>
                <thead className='bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700'>
                  {/* Первый уровень заголовков: Ресурсы */}
                  <tr>
                    <th className='px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700'>
                      Период
                    </th>
                    {property.activeCounters.map((counter) => (
                      <th
                        key={counter}
                        colSpan={3}
                        className='px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase border-l border-slate-200 dark:border-slate-700'
                      >
                        {counter.replace('_', ' ')}
                      </th>
                    ))}
                    <th className='px-4 py-4 text-right'></th>
                  </tr>
                  {/* Второй уровень: Типы данных */}
                  <tr className='border-t border-slate-200 dark:border-slate-700'>
                    <th className='px-6 py-2 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700'></th>
                    {property.activeCounters.map((counter) => (
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
                        <span>{formatDate(new Date().toString())}</span>
                        <span className='text-[10px] text-blue-500 font-bold not-italic'>
                          ПРОГНОЗ НА СЕГОДНЯ
                        </span>
                      </div>
                    </td>
                    {property.activeCounters.map((counter) => {
                      const projection = getProjectedReading(readings, counter)
                      const tariff = getTariffForDate(
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
                        onClick={() => setEditingReading(r)} // Открываем попап редактирования всей строки
                      >
                        <div className='flex items-center gap-2'>
                          <span className='dark:text-white'>{formatDate(r.date)}</span>
                          <span className='text-[10px] font-medium transition-opacity opacity-0 group-hover:opacity-100 text-slate-400 dark:text-blue-400/80'>
                            ред.
                          </span>
                        </div>
                      </td>
                      {property.activeCounters.map((counter) => {
                        const currentVal = r[counter] || 0
                        const prevVal = readings[idx - 1]?.[counter] || 0
                        const diff = idx === 0 ? 0 : currentVal - prevVal
                        const tariff = getTariffForDate(counter, r.date)
                        const sum = diff * tariff

                        return (
                          <React.Fragment key={`${r.id}-${counter}`}>
                            <td className='px-4 py-4 text-sm border-l border-slate-100 dark:border-slate-800'>
                              {currentVal}
                            </td>
                            <td
                              className={cn(
                                'px-4 py-4 text-sm transition-all duration-500 border-l border-slate-100 dark:border-slate-800/50',
                                getHeatmapStyles(diff, counter) // Наша подсветка
                              )}
                            >
                              <div className='flex flex-col'>
                                <span className='text-base'>
                                  {diff > 0 ? `+${diff.toFixed(0)}` : '0'}
                                </span>
                              </div>
                            </td>
                            <td className='px-4 py-4 text-sm font-bold text-slate-900 dark:text-white'>
                              {sum > 0 ? `${sum.toFixed(2)}` : '—'}
                            </td>
                          </React.Fragment>
                        )
                      })}
                      <td className='px-4 py-4 text-right'>
                        <button
                          onClick={() => setReadingToDelete(r.id)}
                          className='p-2 text-slate-400 hover:text-red-500 transition-colors'
                        >
                          <TrashIcon className='w-5 h-5' /> {/* Можно взять из Lucide-React */}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Попап удаления */}
      <Modal
        isOpen={!!readingToDelete}
        onClose={() => setReadingToDelete(null)}
        title='Удалить запись?'
      >
        <div className='space-y-6'>
          <p className='text-slate-500 dark:text-slate-400'>
            Это действие нельзя будет отменить. Показания за эту дату будут безвозвратно удалены.
          </p>
          <div className='flex gap-3'>
            <button
              onClick={handleDelete}
              className='flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors'
            >
              Да, удалить
            </button>
            <button
              onClick={() => setReadingToDelete(null)}
              className='flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-3 rounded-xl font-medium transition-colors'
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>

      {/* Попап редактирования */}
      <Modal
        isOpen={!!editingReading}
        onClose={() => setEditingReading(null)}
        title='Редактирование записи'
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const updated = Object.fromEntries(formData.entries())
            handleUpdate(updated as Partial<Reading>)
          }}
          className='space-y-4'
        >
          <div>
            <label className='block text-xs font-bold text-slate-400 uppercase mb-1'>Дата</label>
            <input
              name='date'
              type='date'
              defaultValue={editingReading?.date}
              className={inputStyles}
            />
          </div>

          {property.activeCounters.map((counter) => (
            <div key={counter}>
              <label className='block text-xs font-bold text-slate-400 uppercase mb-1'>
                {COUNTER_LABELS[counter]}
              </label>
              <input
                name={counter}
                type='number'
                step='0.01'
                defaultValue={editingReading?.[counter]}
                className={inputStyles}
              />
            </div>
          ))}

          <div className='flex gap-3 pt-4'>
            <button
              type='submit'
              className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors'
            >
              Сохранить
            </button>
            <button
              type='button'
              onClick={() => setEditingReading(null)}
              className='flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-3 rounded-xl font-medium transition-colors'
            >
              Отмена
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
