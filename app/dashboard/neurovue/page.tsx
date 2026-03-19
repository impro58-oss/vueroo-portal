import { redirect } from 'next/navigation'

export default function NeuroVuePage() {
  // Serve the static HTML file
  redirect('/neuro/index.html')
}
