export default function Events() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 animate-fadeIn" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none' }}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-primary-100 dark:border-primary-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4 animate-slideDown">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 shadow-lg">
                <svg className="h-6 w-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-success-700 dark:from-white dark:to-success-300 bg-clip-text text-transparent">Events</h1>
                <p className="text-lg font-medium bg-gradient-to-r from-success-600 to-secondary-600 dark:from-success-400 dark:to-secondary-400 bg-clip-text text-transparent">
                  Διαχείριση προπονήσεων και αγώνων
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-120px)]">
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-success-100 dark:bg-success-900/30 mb-6">
            <svg className="h-12 w-12 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Events System - Coming Soon!</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Το σύστημα διαχείρισης events θα προστεθεί σύντομα.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            Θα περιλαμβάνει διαχείριση προπονήσεων, αγώνων, και άλλων εκδηλώσεων της ακαδημίας.
          </p>
          
          {/* Placeholder features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-success-100 dark:border-success-800/30">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-success-100 dark:bg-success-900/30 mx-auto mb-4">
                <svg className="h-6 w-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Προπονήσεις</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Προγραμματισμός και διαχείριση προπονήσεων</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-success-100 dark:border-success-800/30">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-success-100 dark:bg-success-900/30 mx-auto mb-4">
                <svg className="h-6 w-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Αγώνες</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Διαχείριση αγώνων και τουρνουά</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-success-100 dark:border-success-800/30">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-success-100 dark:bg-success-900/30 mx-auto mb-4">
                <svg className="h-6 w-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19l5-5 5 5-5 5-5-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Εκδηλώσεις</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Οργάνωση ειδικών εκδηλώσεων</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}