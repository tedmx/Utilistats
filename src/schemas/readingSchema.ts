import { z } from 'zod'

export const readingSchema = z.object({
  date: z.string().min(1, 'Выберите дату'),

  // Электричество
  elec_t1: z.coerce
    .number({ message: 'Введите число' })
    .min(0, 'Показания не могут быть отрицательными'),

  elec_t2: z.coerce
    .number()
    .min(0)
    .optional()
    .or(z.literal('')),

  // Вода
  water_cold: z.coerce
    .number({ message: 'Введите число' })
    .min(0, 'Минимум 0'),

  water_hot: z.coerce
    .number({ message: 'Введите число' })
    .min(0, 'Минимум 0')
    .optional(),

  // Газ
  gas: z.coerce
    .number()
    .min(0)
    .optional()
    .or(z.literal(''))
})

// Тот самый критически важный экспорт типа
export type ReadingFormValues = z.infer<typeof readingSchema>
