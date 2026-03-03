import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { type PropertyFormValues } from '../schemas/propertySchema'

import { dataService } from '../lib/dataService'
import type { CounterType } from '../mocks/fixtures'
import { SHARED_INPUT_STYLES } from '../lib/constants'

const COUNTER_LABELS: Record<string, string> = {
  elec_t1: 'Электроэнергия T1',
  elec_t2: 'Электроэнергия T2',
  water_cold: 'ХВС (Холодная вода)',
  water_hot: 'ГВС (Горячая вода)',
  gas: 'Газ'
}

export function PropertyEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    defaultValues: {
      name: '',
      address: '',
      activeCounters: [] as CounterType[]
    }
  })

  useEffect(() => {
    if (id) {
      dataService.getPropertyById(id).then(prop => {
        if (prop) {
          setValue('name', prop.name)
          setValue('address', prop.address)
          setValue('activeCounters', prop.activeCounters)
        }
        setLoading(false)
      })
    }
  }, [id, setValue])

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      await dataService.saveProperty({ id, ...data })
      navigate('/') // Возвращаемся на главную после сохранения
    } catch (err) {
      alert('Ошибка при сохранении')
      console.error(err)
    }
  }

  if (loading) return <div className="p-8 text-center">Загрузка...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8">
        {id ? 'Редактировать объект' : 'Добавить новый объект'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Название (например, Дача или Квартира)</label>
          <input
            {...register('name', { required: true })}
            className="w-full px-4 py-2 rounded-xl border dark:bg-slate-900"
            placeholder="Моя квартира"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Адрес</label>
          <input
            {...register('address')}
            className="w-full px-4 py-2 rounded-xl border dark:bg-slate-900"
            placeholder="ул. Пушкина, д. 10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-500 mb-1">
            Тип объекта (тарифная сетка)
          </label>
          <select name="category" className={SHARED_INPUT_STYLES}>
            <option value="moscow_flat">Квартира (Москва)</option>
            <option value="mo_cottage">Дачный участок (Московская обл.)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Какие счетчики установлены?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(COUNTER_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value={key}
                  {...register('activeCounters')}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            {id ? 'Сохранить изменения' : 'Создать объект'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="px-6 py-3 rounded-xl font-medium border border-slate-200 dark:border-slate-700">
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}
