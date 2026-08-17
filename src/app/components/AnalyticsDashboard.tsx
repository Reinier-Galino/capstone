import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface AnalyticsDashboardProps {
  appointments: any[];
  inventory: any[];
  users?: any[];
  projects?: any[];
  consumptionLogs?: any[];
  inquiries?: any[];
  forecasts?: any[];
  onUpdateAppointment?: (appointmentId: number, status: string) => void;
}

interface RecommendationDetail {
  materials: { name: string; description: string; supplier: string }[];
  personnel: { role: string; name: string }[];
  budgetTier: string;
}

const recommendationRules: Record<string, Record<string, RecommendationDetail>> = {
  kitchen: {
    economy: {
      budgetTier: 'Economy',
      materials: [
        { name: 'Laminate Countertops', description: 'Durable and affordable finish', supplier: 'Formica Select' },
        { name: 'Standard Fixtures', description: 'Brushed nickel pulls and handles', supplier: 'Liberty Hardware' },
      ],
      personnel: [
        { role: 'Design Associate', name: 'James Lee' },
        { role: 'Procurement Specialist', name: 'Mila Reyes' },
      ],
    },
    mid: {
      budgetTier: 'Mid',
      materials: [
        { name: 'Quartz Countertops', description: 'Engineered quartz in Calacatta design', supplier: 'Caesarstone' },
        { name: 'Designer Fixtures', description: 'Aged brass pulls and knobs', supplier: 'Rejuvenation' },
      ],
      personnel: [
        { role: 'Lead Designer', name: 'Ari Del Rosario' },
        { role: 'Project Coordinator', name: 'Karla Santos' },
      ],
    },
    premium: {
      budgetTier: 'Premium',
      materials: [
        { name: 'Carrara Marble Countertops', description: 'Italian Carrara marble, honed finish', supplier: 'Stone Source NYC' },
        { name: 'Artisan Hardware', description: 'Hand-forged bronze pulls', supplier: 'E.R. Butler & Co.' },
      ],
      personnel: [
        { role: 'Senior Interior Designer', name: 'Maria Cortez' },
        { role: 'Design Director', name: 'Lara Mendoza' },
      ],
    },
  },
  cabinets: {
    economy: {
      budgetTier: 'Economy',
      materials: [
        { name: 'Pine Construction', description: 'Clear pine with natural grain', supplier: 'Local Lumber Co.' },
        { name: 'Basic Hardware', description: 'Standard hinges and slides', supplier: 'Blum Economy' },
      ],
      personnel: [
        { role: 'Cabinet Specialist', name: 'Ella Cruz' },
        { role: 'Site Manager', name: 'Rey Alonzo' },
      ],
    },
    mid: {
      budgetTier: 'Mid',
      materials: [
        { name: 'White Oak', description: 'Quarter-sawn white oak, select grade', supplier: 'Woodworkers Source' },
        { name: 'Quality Hardware', description: 'Soft-close hinges and full-extension slides', supplier: 'Blum Blumotion' },
      ],
      personnel: [
        { role: 'Lead Designer', name: 'Noel Perez' },
        { role: 'Material Buyer', name: 'Tina Villanueva' },
      ],
    },
    premium: {
      budgetTier: 'Premium',
      materials: [
        { name: 'Figured Walnut', description: 'Book-matched figured walnut veneer', supplier: 'Certainly Wood' },
        { name: 'Premium Hardware', description: 'Concealed European hinges, push-to-open', supplier: 'Hafele Premium' },
      ],
      personnel: [
        { role: 'Senior Designer', name: 'Rina Santos' },
        { role: 'Client Liaison', name: 'Oscar Bautista' },
      ],
    },
  },
  curtains: {
    economy: {
      budgetTier: 'Economy',
      materials: [
        { name: 'Cotton Blend Fabric', description: 'Washable cotton-poly blend', supplier: 'JoAnn Fabrics' },
        { name: 'Standard Rod & Rings', description: 'Brushed nickel rod with clips', supplier: 'Umbra' },
      ],
      personnel: [
        { role: 'Window Treatment Specialist', name: 'Sofia Tan' },
        { role: 'Finishing Lead', name: 'Bea Dela Cruz' },
      ],
    },
    mid: {
      budgetTier: 'Mid',
      materials: [
        { name: 'Belgian Linen', description: 'Medium-weight linen in warm gray', supplier: 'The Shade Store' },
        { name: 'Custom Hardware', description: 'Hand-forged iron rod with finials', supplier: 'Smith & Noble' },
      ],
      personnel: [
        { role: 'Lead Designer', name: 'Nico Romero' },
        { role: 'Fabric Consultant', name: 'Jules Rivera' },
      ],
    },
    premium: {
      budgetTier: 'Premium',
      materials: [
        { name: 'Silk Taffeta', description: 'Dupioni silk in champagne', supplier: 'Scalamandré' },
        { name: 'Bespoke Traverse System', description: 'Motorized track with remote control', supplier: 'Silent Gliss' },
      ],
      personnel: [
        { role: 'Senior Interior Designer', name: 'Amelia Reyes' },
        { role: 'Project Manager', name: 'Andres Flores' },
      ],
    },
  },
  bedframes: {
    economy: {
      budgetTier: 'Economy',
      materials: [
        { name: 'Engineered Pine Frame', description: 'Strong engineered pine bed frame with slatted base', supplier: 'Home Depot Pro' },
        { name: 'Basic Upholstery', description: 'Polyester cover with foam padding', supplier: 'Fabric.com' },
      ],
      personnel: [
        { role: 'Furniture Specialist', name: 'Ian Cruz' },
        { role: 'Workshop Coordinator', name: 'Mila Reyes' },
      ],
    },
    mid: {
      budgetTier: 'Mid',
      materials: [
        { name: 'Solid Oak Frame', description: 'Solid oak bed frame with integrated storage', supplier: 'Woodworkers Source' },
        { name: 'Designer Headboard', description: 'Fabric-upholstered headboard with detail stitching', supplier: 'The Shade Store' },
      ],
      personnel: [
        { role: 'Lead Designer', name: 'Maya Herrera' },
        { role: 'Fabric Consultant', name: 'Jules Rivera' },
      ],
    },
    premium: {
      budgetTier: 'Premium',
      materials: [
        { name: 'Walnut Platform Bed', description: 'Custom walnut bed with concealed storage drawers', supplier: 'Certainly Wood' },
        { name: 'Luxury Upholstery', description: 'Italian velvet upholstery with foam cushioning', supplier: 'Scalamandré' },
      ],
      personnel: [
        { role: 'Senior Interior Designer', name: 'Noel Dizon' },
        { role: 'Project Manager', name: 'Andres Flores' },
      ],
    },
  },
};

const getRecommendationDetail = (projectType: string, budget: number) => {
  const tier = budget < 30000 ? 'economy' : budget < 80000 ? 'mid' : 'premium';
  const projectRules = recommendationRules[projectType] || recommendationRules.kitchen;
  return projectRules[tier] || projectRules.mid;
};

export function AnalyticsDashboard({ appointments, inventory, onUpdateAppointment }: AnalyticsDashboardProps) {
  // expand props
  const users = (arguments[0] && (arguments[0] as any).users) || [];
  const projects = (arguments[0] && (arguments[0] as any).projects) || [];
  const consumptionLogs = (arguments[0] && (arguments[0] as any).consumptionLogs) || [];
  const inquiries = (arguments[0] && (arguments[0] as any).inquiries) || [];
  const forecasts = (arguments[0] && (arguments[0] as any).forecasts) || [];

  // KPIs
  const workforceCount = users.filter((u: any) => u.role && u.role !== 'customer').length;
  const lowStockCount = inventory.filter((i: any) => Number(i.stock || 0) < Number(i.minStock || 0)).length;
  const projectCount = projects.length;
  const projectTypeCounts = appointments.reduce((acc: any, apt) => {
    acc[apt.projectType] = (acc[apt.projectType] || 0) + 1;
    return acc;
  }, {});

  const projectTypeData = Object.entries(projectTypeCounts).map(([type, count], index) => ({
    id: `project-${type}-${index}`,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count as number,
  }));

  const inventoryByCategory = inventory.reduce((acc: any, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(inventoryByCategory).map(([category, count], index) => ({
    id: `category-${category}-${index}`,
    category,
    items: count as number,
  }));

  const totalBudget = appointments.reduce((sum, apt) => sum + parseFloat(apt.budget || 0), 0);
  const avgBudget = appointments.length > 0 ? totalBudget / appointments.length : 0;

  const designerCounts = appointments.reduce((acc: any, apt) => {
    const designer = apt.assignedDesigner || 'Unassigned';
    acc[designer] = (acc[designer] || 0) + 1;
    return acc;
  }, {});

  const designerData = Object.entries(designerCounts).map(([designer, count], index) => ({
    id: `designer-${designer}-${index}`,
    designer,
    count: count as number,
  }));

  

  // Weekly material usage (last 8 weeks)
  const weekIndex = (dstr: string) => Math.floor(new Date(dstr).getTime() / (7 * 24 * 60 * 60 * 1000));
  const thisWeek = weekIndex(new Date().toISOString());
  const weeks = Array.from({ length: 8 }).map((_, i) => thisWeek - (7 - i) + 0); // placeholder to create 8 slots
  // Better: compute last 8 week starting indexes
  const last8Weeks = Array.from({ length: 8 }).map((_, i) => thisWeek - (7 - i));
  const weeklyMap: Record<number, number> = {};
  consumptionLogs.forEach((c: any) => {
    try {
      const w = weekIndex(c.date || c.createdAt || new Date().toISOString());
      weeklyMap[w] = (weeklyMap[w] || 0) + Number(c.qty || 0);
    } catch (e) {}
  });
  const weeklyUsageData = Object.keys(weeklyMap)
    .map(k => ({ week: `W${k}`, usage: weeklyMap[Number(k)] }))
    .sort((a: any, b: any) => (a.week > b.week ? 1 : -1))
    .slice(-8);

  // Top consumed materials
  const consumedByMaterial: Record<string, number> = {};
  consumptionLogs.forEach((c: any) => {
    consumedByMaterial[String(c.materialId)] = (consumedByMaterial[String(c.materialId)] || 0) + Number(c.qty || 0);
  });
  const topConsumed = Object.entries(consumedByMaterial)
    .map(([materialId, qty]) => ({ materialId, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8)
    .map((m) => ({ id: m.materialId, name: (inventory.find((i: any) => String(i.id) === String(m.materialId)) || { name: m.materialId }).name, qty: m.qty }));

  // Low stock items list
  const lowStockItems = inventory.filter((i: any) => Number(i.stock || 0) < Number(i.minStock || 0));

  // Workforce utilization (tasks from consumption logs + assigned appointments)
  const staffUsers = (users || []).filter((u: any) => u.role === 'staff' || u.role === 'supervisor');
  const workforceUtil = staffUsers.map((s: any) => {
    const tasks = consumptionLogs.filter((c: any) => String(c.user || '') === String(s.username)).length;
    const assigned = (appointments || []).filter((a: any) => a.assignedDesigner === s.username).length;
    return { username: s.username, tasks, assigned };
  });

  // Inventory breakdown by category (sum of stock)
  const inventoryByCategoryStock: Record<string, number> = {};
  inventory.forEach((it: any) => {
    inventoryByCategoryStock[it.category || 'Uncategorized'] = (inventoryByCategoryStock[it.category || 'Uncategorized'] || 0) + Number(it.stock || 0);
  });
  const inventoryBreakdown = Object.entries(inventoryByCategoryStock).map(([category, value], idx) => ({ id: `${category}-${idx}`, category, value }));

  // Project completion progress (use project.completion if present)
  const projectProgress = projects.map((p: any) => ({ id: p.id || p.title, title: p.title || `#${p.id}`, completion: Number(p.completion || 0) }));

  // Forecast trend (use forecasts array: each item predicted value or prediction)
  const forecastTrend = (forecasts || []).map((f: any, idx: number) => ({ id: idx, date: f.generatedAt || f.date || `#${idx}`, value: Number(f.prediction || (Array.isArray(f.recommendations) ? f.recommendations.reduce((s: any, r: any) => s + (r.qty || 0), 0) : 0)) }));

  // Appointment handlers removed — analytics focuses on projects, workforce, inventory, and forecasts

  const COLORS = ['#000000', '#D4A55A', '#8B9F8E', '#B89968'];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-border p-8">
          <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Total Workforce</p>
          <p className="text-[2.5rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
            {workforceCount}
          </p>
        </div>

        <div className="border border-border p-8">
          <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Low Stock Materials</p>
          <p className="text-[2.5rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
            {lowStockCount}
          </p>
        </div>

        <div className="border border-border p-8">
          <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Total Projects</p>
          <p className="text-[2.5rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
            {projectCount}
          </p>
        </div>

        <div className="border border-border p-8">
          <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Open Inquiries</p>
          <p className="text-[2.5rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
            {inquiries.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="border border-border p-8 lg:col-span-1">
          <h3 className="text-[1.5rem] mb-4 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>Weekly Material Usage</h3>
          {weeklyUsageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="usage" stroke="#D4A55A" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">No consumption logs yet</p>
          )}
        </div>

        <div className="border border-border p-8 lg:col-span-1">
          <h3 className="text-[1.5rem] mb-4 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>Inventory Breakdown</h3>
          {inventoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={inventoryBreakdown} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                  {inventoryBreakdown.map((entry, idx) => (
                    <Cell key={`inv-${entry.id}-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">No inventory data</p>
          )}
        </div>

        <div className="border border-border p-8 lg:col-span-1">
          <h3 className="text-[1.5rem] mb-4 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>Forecast Trend</h3>
          {forecastTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={forecastTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8B9F8E" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">No forecast history</p>
          )}
        </div>
      </div>

      <div className="border border-border p-8">
        <div className="mb-8">
          <h3 className="text-[1.5rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
            Designer Performance
          </h3>
          <p className="text-sm text-muted-foreground">
            Designers assigned through deterministic project rules by project type and budget.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-8 py-4 text-left text-xs tracking-widest uppercase opacity-50">Designer</th>
                <th className="px-8 py-4 text-left text-xs tracking-widest uppercase opacity-50">Projects Assigned</th>
              </tr>
            </thead>
            <tbody>
              {designerData.map((designer) => (
                <tr key={designer.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-8 py-4">{designer.designer}</td>
                  <td className="px-8 py-4">{designer.count}</td>
                </tr>
              ))}
              {designerData.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-8 py-12 text-center text-muted-foreground">
                    No designer assignments have been made yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="border border-border p-8 lg:col-span-1">
          <h3 className="text-lg mb-4">Top Consumed Materials</h3>
          {topConsumed.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topConsumed} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={140} />
                <Tooltip />
                <Bar dataKey="qty" fill="#D4A55A" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">No consumption data</p>
          )}
        </div>

        <div className="border border-border p-8 lg:col-span-1">
          <h3 className="text-lg mb-4">Low Stock Items</h3>
          {lowStockItems.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {lowStockItems.map((it: any) => (
                <li key={it.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.category} • {it.stock} / min {it.minStock} {it.unit || ''}</div>
                  </div>
                  <div className="text-xs text-destructive">Low</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-12">No low stock materials</p>
          )}
        </div>

        <div className="border border-border p-8 lg:col-span-1">
          <h3 className="text-lg mb-4">Workforce Utilization</h3>
          {workforceUtil.length > 0 ? (
            <div className="space-y-2 text-sm">
              {workforceUtil.map((s: any) => (
                <div key={s.username} className="flex items-center justify-between border-b border-border/50 py-2">
                  <div>
                    <div className="font-medium">{s.username}</div>
                    <div className="text-xs text-muted-foreground">Assigned: {s.assigned}</div>
                  </div>
                  <div className="text-sm">Tasks: {s.tasks}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No staff data</p>
          )}
        </div>
      </div>

      {/* Project completion & alerts moved to Operations page */}

      {/* Appointments removed: analytics focuses on projects, workforce, inventory, and forecasts */}
    </div>
  );
}
