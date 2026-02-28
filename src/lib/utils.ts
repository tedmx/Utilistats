import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { MOCK_TARIFFS } from '../mocks/fixtures'
import type { CounterType } from '../mocks/fixtures'
import type { ReadingFormValues } from '../schemas/readingSchema'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTariffForDate(resource: CounterType, date: string): number {
  // Ищем все тарифы для ресурса, которые начались ДО или В дату замера
  const applicableTariffs = MOCK_TARIFFS
    .filter(t => t.resource === resource && t.startDate <= date)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  // Берем самый свежий из подходящих
  return applicableTariffs[0]?.price || 0
}

export const getProjectedReading = (readings: ReadingFormValues[], counter: CounterType) => {
  if (readings.length < 2) return null

  // Работаем с отсортированным массивом (от старых к новым)
  const last = readings[readings.length - 1]
  const prev = readings[readings.length - 2]
  
  const lastDate = new Date(last.date)
  const today = new Date() // 2026-02-24
  
  // Разница в днях с последнего замера
  const diffTime = today.getTime() - lastDate.getTime()
  const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (daysPassed <= 0) return null

  // Расход за последний полный месяц
  const lastDelta = (last[counter] as number || 0) - (prev[counter] as number || 0)
  const dailyRate = lastDelta / 30
  
  const projection = dailyRate * daysPassed
  const projectedValue = (last[counter] as number || 0) + projection

  return {
    value: projectedValue.toFixed(1),
    delta: projection.toFixed(1)
  }
}
