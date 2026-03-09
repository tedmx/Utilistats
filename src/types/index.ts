import type { ReadingFormValues } from '../schemas/readingSchema'

export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  email: string | null
  role: UserRole
}

export type CounterType = 'elec_t1' | 'elec_t2' | 'water_cold' | 'water_hot' | 'gas'

export interface PropertyCategory {
  id: string
  name: string     // "Квартира в Москве"
  slug: string     // "moscow_flat"
  created_at?: string
}

export interface CategoryTariff {
  id: string
  category_id: string
  counter_type: CounterType
  price: number
  valid_from: string // Дата, с которой начинает действовать тариф
  created_at?: string
}

export interface Property {
  id: string
  name: string
  address: string
  activeCounters: CounterType[]
  category_id: string // Связь с динамической категорией в БД
  user_id: string     // Владелец объекта
  settings?: PropertySettings; // Добавляем это
}

export type Reading = ReadingFormValues & {
  id: string
  property_id: string
  created_at?: string
}

export interface PropertySettings {
  visibleCounters: CounterType[];
  showDailyConsumption: boolean;
}
