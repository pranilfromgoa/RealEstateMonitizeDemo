import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const userProfiles = {
  investor: {
    id: 'investor-001',
    name: 'Alex Rivera',
    email: 'alex.rivera@email.com',
    role: 'investor',
    avatar: 'AR',
  },
  admin: {
    id: 'admin-001',
    name: 'Daniel',
    email: 'daniel@brickchain.com',
    role: 'admin',
    avatar: 'D',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (role) => {
    setUser(userProfiles[role])
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
