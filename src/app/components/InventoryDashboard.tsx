import { useState } from "react";
import { addAuditLog } from "../utils/auth";

const categoryOptions = [
  'Surfaces',
  'Wood',
  'Textiles',
  'Hardware',
  'Finishes',
  'Cabinetry',
  'Fabric',
];

const unitOptions = [
  'slabs',
  'board ft',
  'yards',
  'pieces',
  'boxes',
  'sheets',
  'rolls',
];

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  supplier: string;
  price?: number;
  unitCost?: number;
}

interface InventoryDashboardProps {
  inventory: InventoryItem[];
  setInventory: (inventory: InventoryItem[]) => void;
}

export function InventoryDashboard({ inventory, setInventory }: InventoryDashboardProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    stock: '' as string | number,
    minStock: '' as string | number,
    unit: '',
    supplier: '',
    price: '' as string | number,
  });

  const handleStockUpdate = (id: number, newStock: number) => {
    if (newStock < 0) {
      return;
    }
    const updated = inventory.map(item =>
      item.id === id ? { ...item, stock: newStock } : item
    );
    setInventory(updated);
    localStorage.setItem('inventory', JSON.stringify(updated));
    const item = inventory.find((item) => item.id === id);
    if (item) {
      addAuditLog(`Updated stock for ${item.name} to ${newStock} ${item.unit}`);
    }
    setEditingId(null);
  };

  const handlePriceUpdate = (id: number, newPrice: number) => {
    if (newPrice < 0) return;
    const updated = inventory.map(item =>
      item.id === id ? { ...item, price: newPrice, unitCost: newPrice } : item
    );
    setInventory(updated);
    localStorage.setItem('inventory', JSON.stringify(updated));
    const item = inventory.find((item) => item.id === id);
    if (item) {
      addAuditLog(`Updated unit price for ${item.name} to ₱${newPrice}`);
    }
    setEditingId(null);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    const validatedStock = Number(newItem.stock);
    const validatedMin = Number(newItem.minStock);
    if (validatedStock < 0 || validatedMin < 0) {
      return;
    }

    const item = {
      ...newItem,
      stock: validatedStock,
      minStock: validatedMin,
        price: Number(newItem.price) || 0,
        unitCost: Number(newItem.price) || 0,
      id: Date.now(),
    };
    const updated = [...inventory, item];
    setInventory(updated);
    localStorage.setItem('inventory', JSON.stringify(updated));
    addAuditLog(`Added inventory item ${item.name} (${item.category}) with ${item.stock} ${item.unit}`);
    setNewItem({ name: '', category: '', stock: '', minStock: '', unit: '', supplier: '' });
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: number) => {
    const itemToDelete = inventory.find(item => item.id === id);
    const updated = inventory.filter(item => item.id !== id);
    setInventory(updated);
    localStorage.setItem('inventory', JSON.stringify(updated));
    if (itemToDelete) {
      addAuditLog(`Deleted inventory item ${itemToDelete.name}`);
    }
  };

  const lowStockItems = inventory.filter(item => item.stock < item.minStock);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[2rem] tracking-[-0.02em] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Inventory Management
          </h2>
          {lowStockItems.length > 0 && (
            <p className="text-sm text-destructive">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below minimum stock level
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-primary text-primary-foreground text-sm tracking-wide uppercase border border-primary hover:bg-background hover:text-foreground transition-all duration-300"
        >
          {showAddForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddItem} className="border border-border p-8 space-y-6">
          <h3 className="text-[1.5rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
            Add New Item
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase opacity-70">Item Name</label>
              <input
                type="text"
                required
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase opacity-70">Category</label>
              <select
                required
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
              >
                <option value="">Choose a category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase opacity-70">Current Stock</label>
              <input
                type="number"
                required
                value={newItem.stock}
                onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase opacity-70">Minimum Stock</label>
              <input
                type="number"
                required
                value={newItem.minStock}
                onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase opacity-70">Unit</label>
              <select
                required
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
              >
                <option value="">Choose a unit</option>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase opacity-70">Supplier</label>
              <input
                type="text"
                required
                value={newItem.supplier}
                onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-accent text-accent-foreground text-sm tracking-wide uppercase border border-accent hover:bg-background hover:text-foreground transition-all duration-300"
          >
            Add to Inventory
          </button>
        </form>
      )}

      <div className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-6 py-4 text-left text-xs tracking-widest uppercase opacity-50">Item</th>
                <th className="px-6 py-4 text-left text-xs tracking-widest uppercase opacity-50">Category</th>
                <th className="px-6 py-4 text-left text-xs tracking-widest uppercase opacity-50">Stock</th>
                <th className="px-6 py-4 text-left text-xs tracking-widest uppercase opacity-50">Min Stock</th>
                <th className="px-6 py-4 text-left text-xs tracking-widest uppercase opacity-50">Unit Price</th>
                <th className="px-6 py-4 text-left text-xs tracking-widest uppercase opacity-50">Unit</th>
                <th className="px-6 py-4 text-left text-xs tracking-widest uppercase opacity-50">Supplier</th>
                <th className="px-6 py-4 text-left text-xs tracking-widest uppercase opacity-50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                    item.stock < item.minStock ? 'bg-destructive/5' : ''
                  }`}
                >
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">{item.category}</td>
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        defaultValue={item.stock}
                        onBlur={(e) => handleStockUpdate(item.id, parseInt(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleStockUpdate(item.id, parseInt(e.currentTarget.value));
                          }
                        }}
                        className="w-20 px-2 py-1 border border-border outline-none focus:border-foreground"
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => setEditingId(item.id)}
                        className={`cursor-pointer hover:underline ${
                          item.stock < item.minStock ? 'text-destructive' : ''
                        }`}
                      >
                        {item.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{item.minStock}</td>
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        defaultValue={item.price ?? item.unitCost ?? 0}
                        onBlur={(e) => handlePriceUpdate(item.id, Number(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handlePriceUpdate(item.id, Number((e.target as HTMLInputElement).value));
                          }
                        }}
                        className="w-24 px-2 py-1 border border-border outline-none focus:border-foreground"
                        autoFocus
                      />
                    ) : (
                      <span onClick={() => setEditingId(item.id)} className={`cursor-pointer hover:underline`}>₱{Number(item.price ?? item.unitCost ?? 0).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{item.unit}</td>
                  <td className="px-6 py-4 text-sm opacity-70">{item.supplier}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-xs tracking-wide uppercase opacity-50 hover:opacity-100 hover:text-destructive transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
