import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const trimmed = (email || '').trim() 
      if (!trimmed) throw new Error('Please provide an email')
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(trimmed)) throw new Error('Invalid email format')
      await login(trimmed, password)
      // navigate to dashboard after successful login
      if (!import.meta.env.VITE_DISABLE_AUTO_NAV) navigate('/')
    } catch (err) {
      console.error('Login error (handleSubmit):', err)
      const details = err?.message ?? String(err)
      setError(details)
    }
  }

  // quickLogin removed in cleaned UI

  // debugResult state removed in cleaned UI

  const navigate = useNavigate()

  // testRestSignIn removed in cleaned UI

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        
        <label className="block mb-2">Email
          <input type="email" className="mt-1 w-full border rounded px-2 py-1" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="block mb-4">Password
          <input type="password" className="mt-1 w-full border rounded px-2 py-1" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" type="submit">Login</button>
      </form>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  )
}
