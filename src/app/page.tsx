import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to dashboard by default
  redirect('/dashboard')
  
  // This won't be rendered due to the redirect
  return null
}
