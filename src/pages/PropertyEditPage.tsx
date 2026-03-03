import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { COUNTER_LABELS, SHARED_INPUT_STYLES } from '../lib/constants'
import { supabase } from '../lib/supabase'

import { type PropertyFormValues } from '../schemas/propertySchema'
import type { CounterType, PropertyCategory } from '../types' // Импортируем типы

export function PropertyEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<PropertyCategory[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    defaultValues: {
      name: '',
      address: '',
      category_id: '',
      activeCounters: [] as CounterType[]
    }
  })

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      
      // 1. Загружаем категории для селекта
      const { data: catData } = await supabase
        .from('property_categories')
        .select('*')
        .order('name')
      
      if (catData) setCategories(catData)

      // 2. Если это редактирование, загружаем данные объекта
      if (id) {
        const { data: prop } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single()

        if (prop) {
          setValue('name', prop.name)
          setValue('address', prop.address)
          setValue('category_id', prop.category_id)
          setValue('activeCounters', prop.active_counters)
        }
      }
      setLoading(false)
    }

    loadInitialData()
  }, [id, setValue])

  
  const onSubmit = async (data: PropertyFormValues) => {
    try {
      const payload = {
        name: data.name,
        address: data.address,
        category_id: data.category_id,
        active_counters: data.activeCounters,
        user_id: (await supabase.auth.getUser()).data.user?.id // Привязываем к юзеру
      }

      const { error } = id 
        ? await supabase.from('properties').update(payload).eq('id', id)
        : await supabase.from('properties').insert([payload])

      if (error) throw error
      
      navigate('/')
    } catch (err) {
      alert('Ошибка при сохранении')
      console.error(err)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Загрузка данных...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8 dark:text-white">
        {id ? 'Редактировать объект' : 'Добавить новый объект'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-300">Название (например, Дача или Квартира)</label>
          <input
            {...register('name', { required: 'Введите название' })}
            className={SHARED_INPUT_STYLES}
            placeholder="Моя квартира"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1  dark:text-slate-300">Адрес</label>
          <input
            {...register('address')}
            className={SHARED_INPUT_STYLES}
            placeholder="ул. Пушкина, д. 10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-500 mb-1">
            Тип объекта (тарифная сетка)
          </label>
          <select 
            {...register('category_id', { required: 'Выберите категорию' })}
            className={SHARED_INPUT_STYLES}
          >
            <option value="">Выберите категорию...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 dark:text-slate-300">Какие счетчики установлены?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(COUNTER_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value={key}
                  {...register('activeCounters')}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm dark:text-slate-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            {id ? 'Сохранить изменения' : 'Создать объект'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="px-6 py-3 rounded-xl font-medium border border-slate-200 dark:border-slate-700 dark:text-slate-300">
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}
