import React, { useState, useEffect } from 'react';

interface MaterialRow {
  materialId: string | number;
  qty: number;
}

export function ProjectEditor({ projects = [], inventory = [], onCreate, onUpdate, onDelete }: any) {
  const emptyForm = { id: null, title: '', category: '', description: '', estimatedWork: '', materialsRequired: [] as MaterialRow[] };
  const [form, setForm] = useState<any>(emptyForm);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Reset when projects change
  }, [projects]);

  const addMaterialRow = () => {
    setForm({ ...form, materialsRequired: [...(form.materialsRequired || []), { materialId: '', qty: 0 }] });
  };

  const updateMaterialRow = (index: number, key: string, value: any) => {
    const rows = [...(form.materialsRequired || [])];
    rows[index] = { ...rows[index], [key]: value };
    setForm({ ...form, materialsRequired: rows });
  };

  const removeMaterialRow = (index: number) => {
    const rows = [...(form.materialsRequired || [])];
    rows.splice(index, 1);
    setForm({ ...form, materialsRequired: rows });
  };

  const startEdit = (p: any) => {
    setForm({ ...p, estimatedWork: p.estimatedWork || '', materialsRequired: p.materialsRequired || [] });
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditing(false);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      id: form.id || Date.now(),
      estimatedWork: form.estimatedWork ? Number(form.estimatedWork) : undefined,
      materialsRequired: (form.materialsRequired || []).map((r: any) => ({ materialId: r.materialId, qty: Number(r.qty) }))
    };
    if (editing) {
      onUpdate && onUpdate(payload);
    } else {
      onCreate && onCreate(payload);
    }
    setForm(emptyForm);
    setEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase opacity-70">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border" />
          </div>
          <div>
            <label className="text-xs uppercase opacity-70">Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 border" />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase opacity-70">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase opacity-70">Estimated Work (optional)</label>
            <input type="number" value={form.estimatedWork} onChange={(e) => setForm({ ...form, estimatedWork: e.target.value })} className="w-full px-4 py-3 border" />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={addMaterialRow} className="px-4 py-2 border">Add Material Requirement</button>
          </div>
        </div>

        <div className="space-y-3">
          {(form.materialsRequired || []).map((row: MaterialRow, idx: number) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div>
                <label className="text-xs uppercase opacity-70">Material</label>
                <select value={row.materialId} onChange={(e) => updateMaterialRow(idx, 'materialId', e.target.value)} className="w-full px-3 py-2 border">
                  <option value="">Select material</option>
                  {inventory.map((inv: any) => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase opacity-70">Qty</label>
                <input type="number" value={row.qty} onChange={(e) => updateMaterialRow(idx, 'qty', Number(e.target.value))} className="w-full px-3 py-2 border" />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="button" onClick={() => removeMaterialRow(idx)} className="px-4 py-2 border text-destructive">Remove</button>
                {idx === (form.materialsRequired || []).length - 1 && (
                  <button type="button" onClick={addMaterialRow} className="px-4 py-2 border">Add another</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground">{editing ? 'Save Project' : 'Create Project'}</button>
          {editing && <button type="button" onClick={cancelEdit} className="px-6 py-3 border">Cancel</button>}
        </div>
      </form>

      <div>
        <h3 className="text-lg mb-4">Existing Projects</h3>
        <div className="space-y-3">
          {projects.length > 0 ? projects.map((p: any) => (
            <div key={p.id} className="border border-border p-4 rounded-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs opacity-70">{p.category}</div>
                  {p.description && <div className="text-sm text-muted-foreground mt-2">{p.description}</div>}
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => startEdit(p)} className="px-3 py-2 border text-sm">Edit</button>
                  <button onClick={() => onDelete && onDelete(p.id)} className="px-3 py-2 border text-sm text-destructive">Delete</button>
                </div>
              </div>
              {Array.isArray(p.materialsRequired) && p.materialsRequired.length > 0 && (
                <div className="mt-3 text-sm">
                  <div className="text-xs uppercase opacity-70">Materials Required</div>
                  <ul className="list-disc pl-5">
                    {p.materialsRequired.map((r: any, idx: number) => (
                      <li key={idx}>{(inventory.find((i:any) => String(i.id) === String(r.materialId)) || { name: r.materialId }).name}: {r.qty}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )) : (
            <p className="text-muted-foreground">No projects created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectEditor;
