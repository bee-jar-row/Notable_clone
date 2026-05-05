/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { clearSession, getStoredUser, getToken, saveSession } from '../../shared/api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken())
  const [user, setUser] = useState(getStoredUser())

  const login = useCallback((nextToken, nextUser) => {
    saveSession(nextToken, nextUser)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const updateUser = useCallback((nextUser) => {
    if (!token) return
    saveSession(token, nextUser)
    setUser(nextUser)
  }, [token])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    updateUser,
    logout,
  }), [login, logout, token, updateUser, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

export function ProtectedRoute({ children }) {
  const auth = useAuth()
  const location = useLocation()

  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return children
}
