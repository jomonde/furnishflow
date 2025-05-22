import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { Toaster } from "@/components/ui/sonner"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SupabaseProvider } from "@/providers/supabase-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { ReduxProvider } from "@/providers/ReduxProvider"

// Using system font stack for better performance and reliability
const fontSans = {
  className: "font-sans"
}

export const metadata: Metadata = {
  title: "FurnishFlow - Interior Design CRM",
  description: "AI-enhanced CRM and workflow assistant for interior designers and furniture sales professionals",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontSans.className}>
        <ErrorBoundary>
          <ReduxProvider>
            <SupabaseProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                <div className="flex min-h-screen flex-col">
                  <header className="border-b">
                    <div className="container flex h-16 items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icons.logo className="h-8 w-8" />
                        <span className="text-xl font-bold">FurnishFlow</span>
                      </div>
                      <MainNav />
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm">
                          <Icons.user className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </header>
                  <main className="flex-1">
                    <div className="container py-8">
                      {children}
                    </div>
                  </main>
                  <Toaster />
                </div>
              </TooltipProvider>
            </ThemeProvider>
          </SupabaseProvider>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
