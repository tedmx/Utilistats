import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()

    if (isSignUp) {
      // Регистрация в Supabase
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) alert(error.message)
      else alert('Подтвердите email (если настроено) или войдите!')
    } else {
      // Вход в Supabase
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        alert(error.message)
      } else {
        // Редирект на главную (Dashboard) после успешного входа
        navigate('/')
      }
    }
  }

  // Выносим стили инпутов для чистоты разметки, как в PropertyPage
  const inputStyles = cn(
    'w-full p-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500',
    'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400', // Light
    'dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500' // Dark
  )

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300'>
      <div className='max-w-md w-full p-8 border rounded-3xl shadow-xl transition-colors bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'>
        <h1 className='text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white'>
          {isSignUp ? 'Создать аккаунт' : 'Вход в Utilistats'}
        </h1>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='email'
            placeholder='Email'
            className={inputStyles}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type='password'
            placeholder='Пароль'
            className={inputStyles}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className='w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold transition-colors active:scale-[0.98]'>
            {isSignUp ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className='w-full mt-6 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors'
        >
          {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </div>
    </div>
  )
}
