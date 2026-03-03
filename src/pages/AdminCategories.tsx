import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, ChevronRight, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PropertyCategory } from '../types'

export function AdminCategories() {
  const [categories, setCategories] = useState<PropertyCategory[]>([])
  const [loading, setLoading] = useState(true)

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
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Категории недвижимости</h1>
          <p className="text-slate-500 text-sm">Управление глобальными типами объектов и их тарифами</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-all">
          <Plus className="w-5 h-5" />
          Новая категория
        </button>
      </div>

      <div className="grid gap-4">
        {categories.map(category => (
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
        ))}
      </div>
    </div>
  )
}
