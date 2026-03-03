import type { ReadingFormValues } from '../schemas/readingSchema'
import type { Property as FixtureProperty, CounterType as FixtureCounterType } from '../mocks/fixtures'

// Тип для записи показаний (данные из формы + ID из базы)
export type Reading = ReadingFormValues & { 
  id: string 
  property_id: string // Добавляем, так как это поле есть в БД
}

// Тип для объекта недвижимости (переиспользуем из фикстур или расширяем)
export type Property = FixtureProperty

// Тип для ключей счетчиков
export type CounterType = FixtureCounterType

// Тип для тарифов (пригодится для будущего раздела настроек)
export interface Tariff {
  id: string
  category: CounterType
  price: number
  valid_from: string
}
