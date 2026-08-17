import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function BOMPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [bom, setBom] = useState<any[]>([]);

  useEffect(() => {
    setProjects(JSON.parse(localStorage.getItem('projects') || '[]'));
    setInventory(JSON.parse(localStorage.getItem('inventory') || '[]'));
    setLogs(JSON.parse(localStorage.getItem('consumptionLogs') || '[]'));
  }, []);

  const generateBOM = () => {
    if (!selected) return alert('Select a project');
    const projectLogs = logs.filter(l => String(l.projectId) === String(selected));
    const grouped: Record<string, any> = {};
    projectLogs.forEach((l: any) => {
      grouped[l.materialId] = (grouped[l.materialId] || 0) + l.qty;
    });

    const rows = Object.entries(grouped).map(([materialId, qty]) => {
      const mat = inventory.find(i => String(i.id) === String(materialId)) || { name: 'Unknown', unit: '' };
      const unitCost = mat.price ?? mat.unitCost ?? 0;
      return { materialId, name: mat.name, qty, unit: mat.unit || '', unitCost, total: unitCost * qty };
    });
    setBom(rows);
  };

  const total = bom.reduce((s, r) => s + (r.total || 0), 0);

  return (
    <>
      <Header />
      <main className="max-w-[1000px] mx-auto px-8 lg:px-16 py-32">
        <h1 className="text-[2rem] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Bill of Materials</h1>
        <div className="mb-6">
          <label className="text-xs uppercase opacity-70">Project</label>
          <select value={selected ?? ''} onChange={(e) => setSelected(e.target.value)} className="w-full px-4 py-3 border">
            <option value="">Select project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <button onClick={generateBOM} className="px-6 py-3 bg-primary text-primary-foreground">Generate BOM</button>
        </div>

        {bom.length > 0 ? (
          <div className="border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-6 py-3 text-left">Material</th>
                  <th className="px-6 py-3 text-left">Qty</th>
                  <th className="px-6 py-3 text-left">Unit</th>
                  <th className="px-6 py-3 text-left">Unit Cost</th>
                  <th className="px-6 py-3 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {bom.map((r, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="px-6 py-3">{r.name}</td>
                    <td className="px-6 py-3">{r.qty}</td>
                    <td className="px-6 py-3">{r.unit}</td>
                    <td className="px-6 py-3">₱{Number(r.unitCost).toLocaleString()}</td>
                    <td className="px-6 py-3">₱{Number(r.total).toLocaleString()}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right font-medium">Grand Total</td>
                  <td className="px-6 py-4 font-medium">₱{Number(total).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-muted-foreground">No BOM generated yet for the selected project.</div>
        )}
      </main>
      <Footer />
    </>
  );
}
