'use client';

import { useEffect, useState } from 'react';
import { MedTechData } from '@/lib/medtech-data';

export default function DataTestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/data/portfolio-data', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const portfolioData = await response.json();
        setData(portfolioData);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">MedTech Data Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold">Portfolio Summary:</h2>
        <p>Total Categories: {data?.summary?.totalCategories}</p>
        <p>Wallaby Present: {data?.summary?.wallabyPresent}</p>
        <p>Critical Gaps: {data?.summary?.criticalGaps?.join(', ')}</p>
      </div>
      <pre className="mt-4 bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96 text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}