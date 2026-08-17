import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function ForecastPage() {
  const [result, setResult] = useState<any | null>(null);
  const [computedRecs, setComputedRecs] = useState<any[] | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('forecastResult') || 'null');
    setResult(stored);
    // if there is no recommendations but we have forecastHistory, compute suggested restocks
    if (stored && !Array.isArray(stored.recommendations)) {
      const history = JSON.parse(localStorage.getItem('forecastHistory') || 'null');
      const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      if (Array.isArray(history) && Array.isArray(inventory)) {
        const recs: any[] = [];
        history.forEach((h: any) => {
          const item = inventory.find((i: any) => i.id === h.materialId);
          if (!item) return;
          const forecastQty = Number(h.forecast) || 0; // e.g., next 4 weeks
          const stock = Number(item.stock) || 0;
          const minStock = Number(item.minStock) || 0;
          const qty = Math.max(0, Math.ceil(forecastQty - stock + minStock));
          if (qty > 0) {
            recs.push({ item: item.name, qty, materialId: item.id, supplier: item.supplier });
          }
        });
        setComputedRecs(recs);
      }
    }
  }, []);

  const runForecast = () => {
    // Placeholder - in real system this would call the FastAPI forecasting endpoint
    const sample = {
      generatedAt: new Date().toISOString(),
      summary: 'Simulated forecast (client-side). Connect to forecasting API to run real model.',
      recommendations: [
        { item: 'Quartz Countertop', qty: 12 },
        { item: 'White Oak Boards', qty: 50 },
      ],
    };
    localStorage.setItem('forecastResult', JSON.stringify(sample));
    setResult(sample);
    alert('Forecast simulated and saved locally. Integrate with API for production results.');
  };

  return (
    <>
      <Header />
      <main className="max-w-[1000px] mx-auto px-8 lg:px-16 py-32">
        <div className="space-y-8">
          <h1 className="text-[2rem]" style={{ fontFamily: 'var(--font-serif)' }}>AI-Assisted Material Forecasting</h1>
          <p className="text-sm text-muted-foreground">This page is a placeholder for the Prophet forecasting integration. Use the forecasting API to run the model and display results here.</p>

          <div className="flex gap-4">
            <button onClick={runForecast} className="px-6 py-3 bg-primary text-primary-foreground">Run Forecast</button>
            <button onClick={() => { localStorage.removeItem('forecastResult'); setResult(null); }} className="px-6 py-3 border">Clear</button>
          </div>

          {result ? (
            <div className="border border-border p-6">
              {result.generatedAt && (
                <p className="text-xs opacity-60">Generated: {new Date(result.generatedAt).toLocaleString()}</p>
              )}
              <h3 className="mt-4 text-lg">Recommendations</h3>
              <ul className="list-disc pl-6">
                {(Array.isArray(result.recommendations) ? result.recommendations : (computedRecs || [])).map((r: any, idx: number) => (
                  <li key={idx}>{r.item}: {r.qty}{r.supplier ? ` — ${r.supplier}` : ''}</li>
                ))}
                {(!Array.isArray(result.recommendations) && (!computedRecs || computedRecs.length === 0)) && (
                  <li>No automated recommendations available. Run the forecast or seed sample data.</li>
                )}
              </ul>
            </div>
          ) : (
            <div className="border border-border p-6 text-muted-foreground">No forecast available yet.</div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
