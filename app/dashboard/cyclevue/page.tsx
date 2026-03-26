// CycleVue Dashboard Page
// Uses iframe to embed the static visualization while preserving Next.js routing

export default function CycleVuePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <iframe
        src="/cyclevue/index.html"
        className="w-full min-h-screen border-0"
        title="CycleVue Economic Cycle Intelligence"
      />
    </div>
  );
}
