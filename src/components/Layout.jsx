import AppHeader from './AppHeader'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800">
      <AppHeader />
      <main>
        {children}
      </main>
    </div>
  )
}