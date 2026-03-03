import type { CounterType } from '../types'

/**
 * Человекопонятные названия для счетчиков.
 * Используются в формах, заголовках таблиц и модалках.
 */
export const COUNTER_LABELS: Record<CounterType, string> = {
  elec_t1: 'Электроэнергия T1',
  elec_t2: 'Электроэнергия T2',
  water_cold: 'ХВС (Холодная вода)',
  water_hot: 'ГВС (Горячая вода)',
  gas: 'Газ',
}

/**
 * Единицы измерения для каждого типа ресурса.
 * Пригодятся для вывода в таблицах или графиках (например, "15 м³" или "120 кВт·ч").
 */
export const COUNTER_UNITS: Record<CounterType, string> = {
  elec_t1: 'кВт·ч',
  elec_t2: 'кВт·ч',
  water_cold: 'м³',
  water_hot: 'м³',
  gas: 'м³',
}

/**
 * Цвета для графиков и индикаторов, привязанные к типам ресурсов.
 * Помогает пользователю визуально отличать воду от электричества.
 */
export const COUNTER_COLORS: Record<CounterType, string> = {
  elec_t1: '#f59e0b', // Amber
  elec_t2: '#d97706', // Amber-600
  water_cold: '#3b82f6', // Blue
  water_hot: '#ef4444', // Red
  gas: '#10b981', // Emerald
}

/**
 * Стили для инпутов, которые мы раньше дублировали в компонентах.
 * Теперь их можно импортировать одной строкой.
 */
export const SHARED_INPUT_STYLES = 
  'w-full px-4 py-2 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 ' +
  'border-slate-200 bg-white text-slate-900 ' +
  'dark:border-slate-700 dark:bg-slate-900 dark:text-white'
