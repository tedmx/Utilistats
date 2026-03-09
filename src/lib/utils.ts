import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { CounterType } from '../mocks/fixtures'
import type { ReadingFormValues } from '../schemas/readingSchema'
import type { CategoryTariff } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Находит актуальный тариф для конкретного счетчика на определенную дату.
 * @param tariffs - массив всех тарифов категории из БД
 * @param counter - тип счетчика
 * @param date - дата показаний
 */
export function getTariffForDate(
  tariffs: CategoryTariff[],
  counter: CounterType,
  date: string
): number {
  const targetDate = new Date(date)

  // Фильтруем тарифы по типу счетчика и дате (только те, что уже вступили в силу)
  const validTariffs = tariffs
    .filter(t => t.counter_type === counter && new Date(t.valid_from) <= targetDate)
    // Сортируем по дате начала действия (самые свежие в начале)
    .sort((a, b) => new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime())

  // Возвращаем цену самого свежего подходящего тарифа или 0, если ничего не нашли
  return validTariffs[0]?.price || 0
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

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export const calculateDailyConsumption = (
  currentValue: number,
  prevValue: number,
  currentDate: string,
  prevDate: string
) => {
  const diff = currentValue - prevValue
  if (diff <= 0) return 0

  const date1 = new Date(currentDate)
  const date2 = new Date(prevDate)
  const diffTime = Math.abs(date1.getTime() - date2.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diff / diffDays : 0
}
