import { useState } from "react"

import { supabase } from "../lib/supabase"

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      // Регистрация в Supabase
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) alert(error.message)
      else alert('Подтвердите email (если настроено) или войдите!')
    } else {
      // Вход в Supabase
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-3xl bg-white dark:bg-slate-900 shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isSignUp ? 'Создать аккаунт' : 'Вход в Utilistats'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-3 rounded-xl border dark:bg-slate-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          className="w-full p-3 rounded-xl border dark:bg-slate-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">
          {isSignUp ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>

      <button 
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full mt-4 text-sm text-blue-500 hover:underline"
      >
        {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
    </div>
  )
}
