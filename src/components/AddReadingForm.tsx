import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Loader2 } from 'lucide-react'

import { readingSchema, type ReadingFormValues } from '../schemas/readingSchema'
import { supabase } from '../lib/supabase'
import { COUNTER_LABELS } from '@/lib/constants'

import type { CounterType, Property } from '../types'

interface AddReadingFormProps {
  property: Property
  onSuccess: () => void
}

export function AddReadingForm({ property, onSuccess }: AddReadingFormProps) {
  const [isSaving, setIsSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReadingFormValues>({
    resolver: zodResolver(readingSchema) as Resolver<ReadingFormValues>,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    }
  })

  const onSubmit = async (data: ReadingFormValues) => {
    setIsSaving(true)
    try {
      // Объединяем данные формы с ID объекта
      const payload = {
        ...data,
        property_id: property.id // Добавляем обязательную связь
      }

      const { error } = await supabase.from('readings').insert([payload])
      if (error) throw error
      reset()
      onSuccess()
    } catch (error) {
      console.error('Error saving reading:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8'>
      <h2 className='text-xl font-bold mb-6 dark:text-white'>Новые показания</h2>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-slate-500 ml-1'>Дата показаний</label>
            <input
              type='date'
              {...register('date')}
              className='w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white'
            />
          </div>

          {property.activeCounters.map((counterKey) => {
            // Типизируем ключ строго как один из ключей схемы
            const fieldName = counterKey as keyof ReadingFormValues
            const fieldError = errors[fieldName]

            return (
              <div key={counterKey} className='space-y-2'>
                <label className='text-sm font-bold text-slate-500 ml-1'>
                  {COUNTER_LABELS[counterKey as CounterType] || counterKey}
                </label>
                <input
                  type='number'
                  step='0.01'
                  {...register(fieldName, { valueAsNumber: true })}
                  className='w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 dark:text-white'
                  placeholder='0.00'
                />
                {fieldError?.message && (
                  <p className='text-[10px] text-red-500 ml-2'>
                    {String(fieldError.message)}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <button
          type='submit'
          disabled={isSaving}
          className='w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2'
        >
          {isSaving ? <Loader2 className='w-5 h-5 animate-spin' /> : <Plus className='w-5 h-5' />}
          Сохранить показания
        </button>
      </form>
    </div>
  )
}