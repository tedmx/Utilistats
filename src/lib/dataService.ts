import { supabase } from './supabase'
// import { MOCK_PROPERTIES, MOCK_READINGS } from '../mocks/fixtures'
import type { CategoryTariff, Property, PropertySettings, Reading } from '../types'

const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true'

export const dataService = {
  async getProperties(): Promise<Property[]> {
    // if (!useSupabase) return MOCK_PROPERTIES

    const { data, error } = await supabase.from('properties').select('*')
    if (error) throw error

    // Маппим snake_case (active_counters) в camelCase (activeCounters)
    return data.map(p => ({
      id: p.id,
      name: p.name,
      address: p.address,
      activeCounters: p.active_counters || [], // Трансформация ключа
      category_id: p.category_id,
      user_id: p.user_id,
      settings: p.settings,
    }))
  },

  async getReadings(propertyId: string) {
    // if (!useSupabase) return MOCK_READINGS[propertyId as keyof typeof MOCK_READINGS] || []

    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('property_id', propertyId)
      .order('date', { ascending: true })
    if (error) throw error
    return data
  },

  async getCurrentUser() {
    if (!useSupabase) {
      return { id: 'mock-user-uuid', email: 'demo@example.com' }
    }
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async signOut() {
    if (!useSupabase) return
    await supabase.auth.signOut()
  },

  async getPropertyById(id: string): Promise<Property | null> {
    // if (!useSupabase) return MOCK_PROPERTIES.find(p => p.id === id) || null

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return { ...data, activeCounters: data.active_counters || [] }
  },

  async saveProperty(property: Partial<Property>) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('Пользователь не авторизован')

    const payload = {
      name: property.name,
      address: property.address,
      active_counters: property.activeCounters,
      user_id: user.id // Привязываем к текущему пользователю
    }

    if (property.id) {
      // Редактирование
      if (!useSupabase) return // В моках сохранение не реализуем для простоты
      const { data, error } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', property.id)
        .select()
      if (error) throw error
      return data[0]
    } else {
      // Создание
      if (!useSupabase) {
        console.log('Mock: создали объект', payload)
        return { id: crypto.randomUUID(), ...property }
      }
      const { data, error } = await supabase
        .from('properties')
        .insert([payload])
        .select()
      if (error) throw error
      return data[0]
    }
  },

  async updateReading(reading: Partial<Reading> & { id: string }) {
    const { data, error } = await supabase
      .from('readings')
      .update(reading)
      .eq('id', reading.id)
      .select()

    if (error) throw error
    return data[0]
  },

  async deleteReading(id: string) {
    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getCategoryTariffs(categoryId: string): Promise<CategoryTariff[]> {
    const { data, error } = await supabase
      .from('category_tariffs')
      .select('*')
      .eq('category_id', categoryId)

    if (error) throw error
    return data
  },

  async updatePropertySettings(propertyId: string, settings: PropertySettings) {
    const { data, error } = await supabase
      .from('properties')
      .update({ settings })
      .eq('id', propertyId)
      .select()

    if (error) throw error
    return data[0]
  }
}
