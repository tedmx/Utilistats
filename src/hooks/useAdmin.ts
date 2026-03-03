import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setIsAdmin(data?.role === 'admin')
    }
    checkRole()
  }, [])

  return isAdmin
}
