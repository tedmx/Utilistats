import { useEffect, useState } from 'react'
import { Plus, ChevronRight, Settings, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { SHARED_INPUT_STYLES } from '../lib/constants'

import type { PropertyCategory } from '../types'

export function AdminCategories() {
  const [categories, setCategories] = useState<PropertyCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' })
  
  // Добавляем счетчик для принудительного обновления списка
  const [refreshTick, setRefreshTick] = useState(0)

  // Загрузка данных при входе или при обновлении тика
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('property_categories')
        .select('*')
        .order('name')

      if (!error) setCategories(data)
      setLoading(false)
    }
    fetchCategories()
  }, [refreshTick])

  // Функция для создания категории
  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.slug) return

    const { error } = await supabase
      .from('property_categories')
      .insert([
        { 
          name: newCategory.name, 
          slug: newCategory.slug.toUpperCase() // Приводим к верхнему регистру для единообразия
        }
      ])

    if (!error) {
      setIsModalOpen(false)
      setNewCategory({ name: '', slug: '' })
      // Тикаем счетчик, чтобы вызвать useEffect и обновить список
      setRefreshTick(prev => prev + 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Категории недвижимости</h1>
          <p className="text-slate-500 text-sm">Управление глобальными типами объектов и их тарифами</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Новая категория
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Загрузка категорий...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.length > 0 ? (
            categories.map(category => (
              <div
                key={category.id}
                className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{category.name}</h3>
                    <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase tracking-wider">
                      {category.slug}
                    </code>
                  </div>
                </div>

                <Link
                  to={`/admin/categories/${category.id}/tariffs`}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all"
                >
                  Настроить тарифы
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px]">
              <p className="text-slate-400 italic">Категории еще не созданы</p>
            </div>
          )}
        </div>
      )}

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-6 dark:text-white tracking-tight">Новая категория</h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Название (человеческое)</label>
                <input
                  type="text"
                  placeholder="Например: Квартира в Санкт-Петербурге"
                  className={SHARED_INPUT_STYLES}
                  value={newCategory.name}
                  onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Системное имя (Slug)</label>
                <input
                  type="text"
                  placeholder="Например: SPB_FLAT"
                  className={SHARED_INPUT_STYLES}
                  value={newCategory.slug}
                  onChange={e => setNewCategory({ ...newCategory, slug: e.target.value.replace(/\s+/g, '_').toUpperCase() })}
                />
                <p className="text-[10px] text-slate-500 mt-1 ml-1 italic leading-tight">
                  Используется для системных связей. Автоматически преобразуется в верхний регистр с подчеркиваниями.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
              >
                Отмена
              </button>
              <button 
                onClick={handleCreateCategory}
                disabled={!newCategory.name || !newCategory.slug}
                className="flex-1 px-4 py-3 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:grayscale active:scale-95"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
