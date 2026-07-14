// BlackWatch Intelligence Dashboard Page
// Uses iframe to embed the static visualization while preserving Next.js routing

export default function BlackWatchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <iframe
        src="/blackwatch/index.html"
        className="w-full min-h-screen border-0"
        title="BlackWatch Global Intelligence Signal Board"
      />
    </div>
  );
}