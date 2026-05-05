import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './app/routes'
import { AuthProvider } from './app/providers/AuthContext'
import { FocusSessionProvider } from './features/focus/FocusSessionContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <FocusSessionProvider>
          <AppRoutes />
        </FocusSessionProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
