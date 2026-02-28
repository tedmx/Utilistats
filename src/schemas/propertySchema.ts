import { z } from 'zod'
import type { CounterType } from '../mocks/fixtures'

export const propertySchema = z.object({
  name: z.string().min(1, "Название обязательно для заполнения"),
  address: z.string().optional(),
  activeCounters: z.array(z.string() as z.ZodType<CounterType>).min(1, "Выберите хотя бы один счетчик")
})

export type PropertyFormValues = z.infer<typeof propertySchema>
