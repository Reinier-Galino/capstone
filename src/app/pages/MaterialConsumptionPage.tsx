import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function MaterialConsumptionPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ materialId: '', projectId: '', user: '', qty: 0, date: '' });

  useEffect(() => {
    setInventory(JSON.parse(localStorage.getItem('inventory') || '[]'));
    setProjects(JSON.parse(localStorage.getItem('projects') || '[]'));
    setUsers(JSON.parse(localStorage.getItem('users') || '[]'));
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const material = inventory.find(i => String(i.id) === String(form.materialId));
    if (!material) return alert('Select a material');
    if (!form.projectId) return alert('Select a project');
    if (!form.user) return alert('Enter user');
    if (form.qty <= 0) return alert('Quantity must be greater than zero');

    // Update inventory stock
    const updatedInventory = inventory.map(i =>
      String(i.id) === String(form.materialId) ? { ...i, stock: (i.stock || 0) - form.qty } : i
    );
    setInventory(updatedInventory);
    localStorage.setItem('inventory', JSON.stringify(updatedInventory));

    // Save consumption log
    const logs = JSON.parse(localStorage.getItem('consumptionLogs') || '[]');
    const entry = { id: Date.now(), materialId: form.materialId, projectId: form.projectId, user: form.user, qty: form.qty, date: form.date || new Date().toISOString() };
    localStorage.setItem('consumptionLogs', JSON.stringify([entry, ...logs]));

    alert('Consumption recorded and inventory updated');
    setForm({ materialId: '', projectId: '', user: '', qty: 0, date: '' });
  };

  return (
    <>
      <Header />
      <main className="max-w-[900px] mx-auto px-8 lg:px-16 py-32">
        <h1 className="text-[2rem] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Record Material Consumption</h1>
        <form onSubmit={handleSubmit} className="space-y-6 border border-border p-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase opacity-70">Material</label>
              <select value={form.materialId} onChange={(e) => setForm({ ...form, materialId: e.target.value })} className="w-full px-4 py-3 border">
                <option value="">Select material</option>
                {inventory.map(i => <option key={i.id} value={i.id}>{i.name} — {i.stock} {i.unit || ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase opacity-70">Project</label>
              <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="w-full px-4 py-3 border">
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase opacity-70">Recorded By</label>
              <input value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} className="w-full px-4 py-3 border" placeholder="Employee name" />
            </div>
            <div>
              <label className="text-xs uppercase opacity-70">Quantity</label>
              <input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} className="w-full px-4 py-3 border" />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase opacity-70">Date</label>
            <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3 border" />
          </div>

          <div>
            <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground">Record Consumption</button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
