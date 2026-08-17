import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { InventoryDashboard } from '../components/InventoryDashboard';

export function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [forecasts, setForecasts] = useState<any[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('inventory') || '[]');
    setInventory(stored);
    const f = JSON.parse(localStorage.getItem('forecastHistory') || '[]');
    setForecasts(f.slice(0, 5));
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-[1200px] mx-auto px-8 lg:px-16 py-32">
        <div className="mb-8 flex items-center gap-4">
          <input placeholder="Search materials..." value={query} onChange={(e) => setQuery(e.target.value)} className="px-4 py-3 border w-full max-w-md" />
          <a href="/consume" className="px-4 py-3 border">Record Consumption</a>
          <a href="/bom" className="px-4 py-3 border">Generate BOM</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <InventoryDashboard inventory={inventory.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))} setInventory={setInventory} />
          </div>
          <aside className="space-y-6">
            <div className="border border-border p-6">
              <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Recent AI Forecasts</h3>
              {forecasts.length > 0 ? forecasts.map((f, idx) => (
                <div key={idx} className="mb-3 border-b border-border/50 pb-3">
                  <div className="font-medium">{f.material}</div>
                  <div className="text-sm text-muted-foreground">Period: {f.period} • Predicted: {f.prediction}</div>
                  <div className="text-xs opacity-60">Generated: {new Date(f.generatedAt).toLocaleString()}</div>
                </div>
              )) : <div className="text-sm text-muted-foreground">No forecasts yet.</div>}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
