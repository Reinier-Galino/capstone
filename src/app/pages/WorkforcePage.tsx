import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function WorkforcePage() {
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('workforce') || '[]');
    setWorkers(stored.length ? stored : [
      { id: 1, name: 'Alice', role: 'Installer', status: 'available' },
      { id: 2, name: 'Ben', role: 'Carpenter', status: 'deployed' },
    ]);
  }, []);

  const toggleStatus = (id: number) => {
    const updated = workers.map(w => w.id === id ? { ...w, status: w.status === 'available' ? 'deployed' : 'available' } : w);
    setWorkers(updated);
    localStorage.setItem('workforce', JSON.stringify(updated));
  };

  return (
    <>
      <Header />
      <main className="max-w-[900px] mx-auto px-8 lg:px-16 py-32">
        <h1 className="text-[2rem] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Workforce Deployment</h1>
        <div className="space-y-4">
          {workers.map(worker => (
            <div key={worker.id} className="border border-border p-4 flex justify-between items-center">
              <div>
                <div className="font-medium">{worker.name}</div>
                <div className="text-xs opacity-70">{worker.role}</div>
              </div>
              <div>
                <span className="text-sm mr-4">{worker.status}</span>
                <button onClick={() => toggleStatus(worker.id)} className="px-4 py-2 border">Toggle</button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
