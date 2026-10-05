import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import { checkBackendStatus } from './api/api'

function App() {
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    checkBackendStatus().then(res => {
      if(res.status === 'error') {
        setBackendStatus('error')
      } else {
        setBackendStatus('ok')
      }
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-100">
      {backendStatus === 'error' && (
        <div className="bg-danger/20 border-b border-danger/50 text-danger text-center py-2 text-sm">
      
        </div>
      )}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Dashboard />
      </main>
    </div>
  )
}

export default App
