import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2, History } from 'lucide-react'

import { supabase } from '../lib/supabase'
import { COUNTER_LABELS, COUNTER_UNITS, SHARED_INPUT_STYLES } from '../lib/constants'
import { formatDate } from '../lib/utils'

import type { CategoryTariff, PropertyCategory, CounterType } from '../types'

export function AdminTariffs() {
  const { categoryId } = useParams()
  const [category, setCategory] = useState<PropertyCategory | null>(null)
  const [tariffs, setTariffs] = useState<CategoryTariff[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Состояние для формы добавления
  const [newPrices, setNewPrices] = useState<Partial<Record<CounterType, { price: string, date: string }>>>({})

  const fetchData = useCallback(async () => {
    if (!categoryId) return

    const [catRes, tariffRes] = await Promise.all([
      supabase.from('property_categories').select('*').eq('id', categoryId).single(),
      supabase.from('category_tariffs').select('*').eq('category_id', categoryId).order('valid_from', { ascending: false })
    ])

    if (catRes.data) setCategory(catRes.data)
    if (tariffRes.data) setTariffs(tariffRes.data)
    setIsLoading(false)
  }, [categoryId])

  useEffect(() => {
    // В общем это копия fetchData.
    // На этот шаг пришлось идти из-за жалоб линтера.
    const loadData = async () => {
      if (!categoryId) return

      const [catRes, tariffRes] = await Promise.all([
        supabase.from('property_categories').select('*').eq('id', categoryId).single(),
        supabase.from('category_tariffs').select('*').eq('category_id', categoryId).order('valid_from', { ascending: false })
      ])

      if (catRes.data) setCategory(catRes.data)
      if (tariffRes.data) setTariffs(tariffRes.data)
      setIsLoading(false)
    }
    loadData()
  }, [categoryId])

  const groupedTariffs = useMemo(() => {
    const groups: Record<string, CategoryTariff[]> = {}
    tariffs.forEach(t => {
      if (!groups[t.counter_type]) groups[t.counter_type] = []
      groups[t.counter_type].push(t)
    })
    return groups
  }, [tariffs])

  const handleAddTariff = async (type: CounterType) => {
    const data = newPrices[type]
    if (!data?.price || !data?.date) return

    const { error } = await supabase.from('category_tariffs').insert({
      category_id: categoryId,
      counter_type: type,
      price: parseFloat(data.price),
      valid_from: data.date
    })

    if (!error) {
      setNewPrices(prev => ({ ...prev, [type]: { price: '', date: '' } }))
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот тариф?')) return
    const { error } = await supabase.from('category_tariffs').delete().eq('id', id)
    if (!error) fetchData()
  }

  if (isLoading) return <div className='p-8 text-center text-slate-500'>Загрузка тарифов...</div>

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-8'>
      <header className='space-y-2'>
        <Link to='/admin/categories' className='inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors'>
          <ChevronLeft className='w-4 h-4' />
          Назад к категориям
        </Link>
        <h1 className='text-3xl font-black dark:text-white'>
          Тарифы: <span className='text-blue-600'>{category?.name}</span>
        </h1>
      </header>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {(Object.keys(COUNTER_LABELS) as CounterType[]).map((type) => (
          <div key={type} className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex flex-col'>
            <div className='flex justify-between items-center mb-6'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-slate-100 dark:bg-slate-800 rounded-xl'>
                  <History className='w-5 h-5 text-slate-500' />
                </div>
                <h3 className='font-bold text-lg dark:text-white'>{COUNTER_LABELS[type]}</h3>
              </div>
              <span className='text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-md'>
                {COUNTER_UNITS[type]}
              </span>
            </div>

            {/* Форма быстрого добавления */}
            <div className='grid grid-cols-2 gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl'>
              <div className='space-y-1'>
                <label className='text-[10px] font-bold text-slate-400 uppercase ml-1'>Цена (₽)</label>
                <input
                  type='number'
                  step='0.01'
                  placeholder='0.00'
                  value={newPrices[type]?.price || ''}
                  onChange={e => setNewPrices(prev => ({ ...prev, [type]: { ...prev[type]!, price: e.target.value, date: prev[type]?.date || '' } }))}
                  className={SHARED_INPUT_STYLES}
                />
              </div>
              <div className='space-y-1'>
                <label className='text-[10px] font-bold text-slate-400 uppercase ml-1'>С даты</label>
                <div className='flex gap-2'>
                  <input
                    type='date'
                    value={newPrices[type]?.date || ''}
                    onChange={e => setNewPrices(prev => ({ ...prev, [type]: { ...prev[type]!, date: e.target.value, price: prev[type]?.price || '' } }))}
                    className={SHARED_INPUT_STYLES}
                  />
                  <button
                    onClick={() => handleAddTariff(type)}
                    disabled={!newPrices[type]?.price || !newPrices[type]?.date}
                    className='bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all'
                  >
                    <Plus className='w-6 h-6' />
                  </button>
                </div>
              </div>
            </div>

            {/* История цен */}
            <div className='flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar'>
              {groupedTariffs[type]?.length ? (
                groupedTariffs[type].map((t) => (
                  <div key={t.id} className='flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'>
                    <div className='flex flex-col'>
                      <span className='text-sm font-bold dark:text-white'>{t.price.toFixed(2)} ₽</span>
                      <span className='text-[10px] text-slate-500'>Действует с {formatDate(t.valid_from)}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className='p-2 text-slate-300 hover:text-red-500 transition-colors'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                ))
              ) : (
                <p className='text-center py-4 text-xs text-slate-400 italic'>История тарифов пуста</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
