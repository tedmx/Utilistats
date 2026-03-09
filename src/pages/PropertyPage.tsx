import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Plus, Settings2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { EditReadingModal } from '../components/EditReadingModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { ReadingsTable } from '../components/ReadingsTable'

import { calculateDailyConsumption, cn } from '../lib/utils'
import { dataService } from '../lib/dataService'

import type { Reading, CounterType, PropertySettings, } from '../types'
import { AddReadingForm } from '@/components/AddReadingForm'
import { COUNTER_LABELS } from '@/lib/constants'
import { TableSettingsPanel } from '@/components/TableSettingsPanel'

export function PropertyPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingReading, setEditingReading] = useState<Reading | null>(null)
  const [readingToDelete, setReadingToDelete] = useState<string | null>(null)

  const [localSettings, setLocalSettings] = useState<PropertySettings | null>(null)

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: dataService.getProperties
  })

  const property = properties.find((p) => p.id === id)

  // Запрос 2: Показания
  const { data: readings = [], isLoading: isLoadingReadings } = useQuery({
    queryKey: ['readings', id],
    queryFn: () => dataService.getReadings(id!),
    enabled: !!id,
  })

  // 3. Загрузка тарифов (только если есть property)
  const { data: categoryTariffs = [] } = useQuery({
    queryKey: ['tariffs', property?.category_id],
    queryFn: () => dataService.getCategoryTariffs(property!.category_id!),
    enabled: !!property?.category_id
  })

  const counterStats = useMemo(() => {
    const result: Record<string, { min: number; max: number }> = {}
    if (!property || readings.length === 0) return result

    property.activeCounters.forEach((counter: CounterType) => {
      // Рассчитываем суточное потребление для каждой записи
      const dailyValues = readings
        .map((r, i) => {
          if (i === 0) return 0 // Для первой записи дельта 0

          const currentVal = (r[counter] as number) || 0
          const prevReading = readings[i - 1]
          const prevVal = (prevReading?.[counter] as number) || 0

          // Используем ту же утилиту, что и в таблице
          return calculateDailyConsumption(currentVal, prevVal, r.date, prevReading.date)
        })
        .filter((v) => v > 0)

      if (dailyValues.length > 0) {
        result[counter] = {
          min: Math.min(...dailyValues),
          max: Math.max(...dailyValues),
        }
      }
    })
    return result
  }, [readings, property])

  const getHeatmapStyles = (dailyValue: number, counter: string) => {
    if (dailyValue <= 0) return ''

    const stats = counterStats[counter]
    if (!stats || stats.max === stats.min) return 'bg-blue-100/10'

    // Вычисляем относительное положение: 0 — это минимум, 1 — это максимум
    const ratio = (dailyValue - stats.min) / (stats.max - stats.min)

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

  // Мутация на удаление
  const deleteMutation = useMutation({
    mutationFn: (readingId: string) => dataService.deleteReading(readingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings', id] })
      setReadingToDelete(null)
    }
  })

  // Мутация на обновление
  const updateMutation = useMutation({
    mutationFn: (reading: Partial<Reading> & { id: string }) => dataService.updateReading(reading),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings', id] })
      setEditingReading(null)
    }
  })

  const settingsMutation = useMutation({
    mutationFn: (newSettings: PropertySettings) =>
      dataService.updatePropertySettings(id!, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
    onError: (err) => {
      // Если вдруг ошибка — возвращаем как было и уведомляем
      console.error('Не удалось сохранить настройки:', err)
      setLocalSettings(property?.settings || defaultSettings)
      alert('Ошибка сохранения настроек на сервере')
    }
  })

  // Дефолтные настройки, если в БД еще пусто
  const defaultSettings: PropertySettings = {
    visibleCounters: (property?.activeCounters as CounterType[]) || [],
    showDailyConsumption: false
  }

  const handleSettingsChange = (newSettings: PropertySettings) => {
    // Сначала обновляем UI (мгновенно)
    setLocalSettings(newSettings)

    // Затем отправляем в БД фоном (не блокируя интерфейс)
    settingsMutation.mutate(newSettings)
  }

  const displaySettings = localSettings || property?.settings || defaultSettings

  if (isLoadingReadings) {
    return (
      <div className='flex flex-col items-center justify-center min-h-100 space-y-4'>
        <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
        <p className='text-slate-500 animate-pulse'>Загружаем данные из облака...</p>
      </div>
    )
  }
  if (!property) return <div className='p-8 text-center'>Объект не найден</div>

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-black dark:text-white tracking-tight'>
          {property?.name || 'Загрузка...'}
        </h1>

        <div className='flex items-center gap-3'>
          {/* Кнопка "Добавить показания" */}
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95',
              isFormVisible ? 'bg-slate-100 dark:bg-slate-800' : 'bg-blue-600 text-white'
            )}
          >
            <Plus className={cn('w-5 h-5 transition-transform duration-300', isFormVisible && 'rotate-45')} />
            <span>{isFormVisible ? 'Закрыть' : 'Добавить показания'}</span>
          </button>

          {/* Основная кнопка настроек объекта */}
          <Link
            to={`/property/${id}/edit`}
            className='fp-2 bg-slate-100 dark:bg-slate-800 rounded-xl'
            title="Настройки объекта"
          >
            <Settings2 className='w-5 h-5 text-slate-500' />
          </Link>
        </div>
      </div>

      {/* Новая форма */}
      {isFormVisible && property && (
        <AddReadingForm
          property={property}
          onSuccess={() => {
            setIsFormVisible(false)
            queryClient.invalidateQueries({ queryKey: ['readings', id] })
          }}
        />
      )}

      {property && (
        <TableSettingsPanel
          activeCounters={property.activeCounters as CounterType[]}
          settings={displaySettings}
          onSettingsChange={handleSettingsChange}
          isUpdating={settingsMutation.isPending}
        />
      )}

      {/* Таблица на всю ширину */}
      <div className='space-y-4'>
        <h2 className='text-xl font-bold dark:text-white'>История потребления</h2>
        {isLoadingReadings ? (
          <div className='space-y-4 animate-pulse'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full' />
            ))}
          </div>
        ) : (
          <ReadingsTable
            readings={readings}
            property={property}
            counterLabels={COUNTER_LABELS}
            onEdit={setEditingReading}
            onDelete={setReadingToDelete}
            getHeatmapStyles={getHeatmapStyles}
            categoryTariffs={categoryTariffs}
            settings={displaySettings}
          />
        )}
      </div>

      <EditReadingModal
        isOpen={!!editingReading}
        reading={editingReading}
        property={property}
        onClose={() => setEditingReading(null)}
        onSave={async (data) => {
          const {
            id,
          } = data
          // Мы знаем, что при редактировании id обязан быть.
          // Если по какой-то причине его нет, мутация не должна вызываться.
          if (typeof id !== 'string') {
            console.error("Попытка обновить запись без ID")
            return
          }
          await updateMutation.mutateAsync({
            ...data,
            id,
          })
        }}
      />

      <DeleteConfirmModal
        isOpen={!!readingToDelete}
        onClose={() => setReadingToDelete(null)}
        onConfirm={async () => {
          if (readingToDelete) {
            await deleteMutation.mutateAsync(readingToDelete)
          }
        }}
      />
    </div>
  )
}
