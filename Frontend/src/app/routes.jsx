import { Navigate, Routes, Route } from 'react-router-dom'
import Notebook from '../features/notebook/pages/Notebook'
import Register from '../features/auth/pages/Register'
import Dashboard from '../features/dashboard/pages/Dashboard'
import Login from '../features/auth/pages/Login'
import ResetPassword from '../features/auth/pages/ResetPassword'
import NewPassword from '../features/auth/pages/NewPassword'
import Settings from '../features/settings/pages/Settings'
import EditChapter from '../features/chapter/pages/EditChapter'
import FolderDetail from '../features/workspace/pages/FolderDetail'
import { ProtectedRoute } from './providers/AuthContext'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/notebook" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/notebook/:id"
        element={(
          <ProtectedRoute>
            <Notebook />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/notebook/:notebookId/chapter/:chapterId/edit"
        element={(
          <ProtectedRoute>
            <EditChapter />
          </ProtectedRoute>
        )}
      />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/new-password" element={<NewPassword />} />
      <Route
        path="/folder/:id"
        element={(
          <ProtectedRoute>
            <FolderDetail />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/settings"
        element={(
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />
      <Route path="/" element={<Login />} />
    </Routes>
  )
}

export default AppRoutes
