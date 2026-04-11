import { redirect } from 'next/navigation'

export default function QuantVuePage() {
  // Serve the static HTML file
  redirect('/quantvue/index.html')
}
