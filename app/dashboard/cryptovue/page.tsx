import { redirect } from 'next/navigation'

export default function CryptoVuePage() {
  // Serve the static HTML file
  redirect('/crypto/index.html')
}
