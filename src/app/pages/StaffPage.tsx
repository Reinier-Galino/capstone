import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { getCurrentUser, addAuditLog } from '../utils/auth';

export function StaffPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const inv = JSON.parse(localStorage.getItem('inventory') || '[]');
    setInventory(inv);
    const projs = JSON.parse(localStorage.getItem('projects') || '[]');
    setProjects(projs);
  }, []);

  const saveInventory = (items: any[]) => {
    setInventory(items);
    localStorage.setItem('inventory', JSON.stringify(items));
  };

  const recordConsumption = (item: any) => {
    const qty = Number(prompt(`Record consumption for ${item.name} (qty):`, '1') || '0');
    if (!qty || qty <= 0) return;
    // update stock
    const updated = inventory.map((i) => i.id === item.id ? { ...i, stock: (Number(i.stock) || 0) - qty } : i);
    saveInventory(updated);
    // add consumption log
    const logs = JSON.parse(localStorage.getItem('consumptionLogs') || '[]');
    logs.unshift({ id: `c-${Date.now()}`, projectId: null, materialId: item.id, qty, date: new Date().toISOString(), user: currentUser?.username || 'staff' });
    localStorage.setItem('consumptionLogs', JSON.stringify(logs));
    addAuditLog(`${currentUser?.username || 'staff'} consumed ${qty} of ${item.name}`);
    alert('Consumption recorded.');
  };

  const saveProjectProgress = (projId: string, progress: number) => {
    const updated = projects.map(p => p.id === projId ? { ...p, progress: Math.max(0, Math.min(100, progress)) } : p);
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
    addAuditLog(`${currentUser?.username || 'staff'} updated project ${projId} progress to ${progress}%`);
  };

  const markDelivered = (projId: string) => {
    const updated = projects.map(p => p.id === projId ? { ...p, delivered: true } : p);
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
    addAuditLog(`${currentUser?.username || 'staff'} marked project ${projId} as delivered`);
  };

  const assigned = projects.filter(p => p.assignedStaff === currentUser?.username);

  return (
    <>
      <Header />
      <main className="max-w-[1100px] mx-auto px-8 lg:px-16 py-32">
        <div className="space-y-6">
          <h1 className="text-2xl">Operational Staff Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome {currentUser?.username}. Use the tools below to update inventory, record consumption, and update project progress.</p>

          <section className="border border-border p-6">
            <h2 className="text-lg mb-3">Inventory - Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.map(it => (
                <div key={it.id} className="p-3 border rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">Stock: {it.stock} {it.unit}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => recordConsumption(it)} className="px-3 py-1 border">Record Consumption</button>
                      <button onClick={() => {
                        const newStock = Number(prompt('Set new stock level:', String(it.stock)) || it.stock);
                        if (Number.isFinite(newStock)) {
                          const updated = inventory.map(i => i.id === it.id ? { ...i, stock: newStock } : i);
                          saveInventory(updated);
                          addAuditLog(`${currentUser?.username || 'staff'} set stock for ${it.name} to ${newStock}`);
                        }
                      }} className="px-3 py-1 border">Set Stock</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-border p-6">
            <h2 className="text-lg mb-3">Assigned Projects</h2>
            {assigned.length === 0 ? (
              <div className="text-sm text-muted-foreground">No projects currently assigned to you.</div>
            ) : (
              assigned.map(p => (
                <div key={p.id} className="mb-4 p-3 border rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{p.title} <span className="text-xs text-muted-foreground">({p.id})</span></div>
                      <div className="text-sm text-muted-foreground">Progress: {p.progress ?? 0}%</div>
                    </div>
                    <div className="flex gap-2">
                      <input type="number" defaultValue={p.progress ?? 0} onBlur={(e) => saveProjectProgress(p.id, Number(e.target.value))} className="w-20 px-2 py-1 border" />
                      {!p.delivered && <button onClick={() => markDelivered(p.id)} className="px-3 py-1 border">Mark Delivered</button>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}

export default StaffPage;
