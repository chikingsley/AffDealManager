import { ThemeProvider } from "@/components/theme-provider"
import FinanceOverview from "@/components/finance/FinanceOverview"

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <FinanceOverview />
      </div>
    </ThemeProvider>
  )
}

export default App