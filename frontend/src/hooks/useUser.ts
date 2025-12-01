import { useEffect, useState } from 'react'
import axios from 'axios'

export interface UserData {
  id: number
  name: string
  email: string
  role?: string
  description?: string
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/auth/me', {
          headers: { Authorization: 'Bearer ' + token },
        })
        setUser(res.data.user)
      } catch (err) {
        console.error('Error obteniendo usuario en /auth/me', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, setUser, loading }
}
