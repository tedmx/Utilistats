import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { ReadingsTable } from '../components/ReadingsTable'

import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'
import { dataService } from '../lib/dataService'
import { readingSchema } from '../schemas/readingSchema'

import type { ReadingFormValues } from '../schemas/readingSchema'
import type { Resolver } from 'react-hook-form'
import type { Reading, Property, CounterType } from '../types'
import { EditReadingModal } from '../components/EditReadingModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'

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
      <div className='flex flex-col items-center justify-center min-h-100 space-y-4'>
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
            <ReadingsTable
              readings={readings}
              property={property}
              counterLabels={COUNTER_LABELS}
              onEdit={setEditingReading}
              onDelete={setReadingToDelete}
              getHeatmapStyles={getHeatmapStyles}
            />
          )}
        </div>
      </div>

      <EditReadingModal
        isOpen={!!editingReading}
        reading={editingReading}
        property={property}
        onClose={() => setEditingReading(null)}
        onSave={handleUpdate}
      />

      <DeleteConfirmModal
        isOpen={!!readingToDelete}
        onClose={() => setReadingToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
