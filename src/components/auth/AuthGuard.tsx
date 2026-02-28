import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

import type { Session } from '@supabase/supabase-js'

const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // В Mock-режиме просто пропускаем
    if (!useSupabase) {
      setLoading(false)
      return
    }

    // Проверяем текущую сессию в Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Слушаем изменения (вход/выход)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  // Если Supabase включен и сессии нет — отправляем на логин
  if (useSupabase && !session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
