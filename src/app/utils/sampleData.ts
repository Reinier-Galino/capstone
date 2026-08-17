export function seedSampleData() {
  const users = [
    { username: 'supervisor', email: 'supervisor@mofil.local', passwordHash: 'mofil-1', role: 'supervisor' },
    { username: 'alice', email: 'alice@mofil.local', passwordHash: 'mofil-2', role: 'staff' },
    { username: 'bob', email: 'bob@mofil.local', passwordHash: 'mofil-3', role: 'staff' },
    { username: 'claire', email: 'claire@mofil.local', passwordHash: 'mofil-4', role: 'designer' },
  ];

  const inventory = [
    { id: 1, name: 'Quartz Countertops', category: 'Surfaces', stock: 15, minStock: 10, unit: 'slabs', supplier: 'Caesarstone', price: 12000, unitCost: 12000 },
    { id: 2, name: 'White Oak Lumber', category: 'Wood', stock: 45, minStock: 30, unit: 'board ft', supplier: 'Woodworkers Source', price: 25, unitCost: 25 },
    { id: 3, name: 'Carrara Marble', category: 'Surfaces', stock: 8, minStock: 5, unit: 'slabs', supplier: 'Stone Source NYC', price: 15000, unitCost: 15000 },
    { id: 4, name: 'Belgian Linen Fabric', category: 'Textiles', stock: 120, minStock: 80, unit: 'yards', supplier: 'The Shade Store', price: 45, unitCost: 45 },
    { id: 5, name: 'Soft-Close Hinges', category: 'Hardware', stock: 250, minStock: 200, unit: 'pieces', supplier: 'Blum', price: 6, unitCost: 6 },
    { id: 6, name: 'Zellige Tiles', category: 'Finishes', stock: 12, minStock: 10, unit: 'boxes', supplier: 'Clé Tile', price: 80, unitCost: 80 },
    { id: 7, name: 'Walnut Veneer', category: 'Wood', stock: 28, minStock: 20, unit: 'sheets', supplier: 'Certainly Wood', price: 200, unitCost: 200 },
    { id: 8, name: 'Brass Hardware', category: 'Hardware', stock: 180, minStock: 150, unit: 'pieces', supplier: 'Rejuvenation', price: 12, unitCost: 12 },
  ];

  const projects = [
    {
      id: 'P-1001',
      title: 'Kitchen Remodel - Rivera',
      materialsRequired: [{ materialId: 1, qty: 3 }, { materialId: 5, qty: 30 }],
      estimatedWork: 10,
      assignedStaff: '',
      image: '/images/p1.svg',
      curatorNote: 'A bright, functional kitchen with warm wood tones and durable surfaces.',
      reviews: [
        { name: 'Maria R.', rating: 5, text: 'Absolutely love the finish and layout.', createdAt: new Date().toISOString() },
        { name: 'Jon P.', rating: 4, text: 'Great workmanship, minor delays.', createdAt: new Date().toISOString() }
      ]
    },
    {
      id: 'P-1002',
      title: 'Bathroom Refresh - Chen',
      materialsRequired: [{ materialId: 3, qty: 2 }, { materialId: 6, qty: 5 }],
      estimatedWork: 6,
      assignedStaff: '',
      image: '/images/p2.svg',
      curatorNote: 'A serene bathroom update that balances stone and texture for a calm retreat.',
      reviews: [
        { name: 'Alex C.', rating: 5, text: 'Transformed our small bathroom into a spa-like space.', createdAt: new Date().toISOString() }
      ]
    },
    {
      id: 'P-1003',
      title: 'Custom Wardrobe - Gomez',
      materialsRequired: [{ materialId: 2, qty: 100 }, { materialId: 7, qty: 4 }],
      estimatedWork: 15,
      assignedStaff: '',
      image: '/images/p3.svg',
      curatorNote: 'Tailored storage solutions with rich wood finishes and efficient layout.',
      reviews: [
        { name: 'S. Gomez', rating: 5, text: 'Exactly what we wanted. Perfect fit and finish.', createdAt: new Date().toISOString() }
      ]
    },
  ];

  // Generate consumption logs across last 8 weeks for trend
  const now = new Date();
  const consumptionLogs: any[] = [];
  for (let w = 8; w >= 0; w--) {
    const weekDate = new Date(now);
    weekDate.setDate(now.getDate() - w * 7);
    // create a few entries per week
    consumptionLogs.push({ id: `c-${w}-1`, projectId: 'P-1001', materialId: 1, qty: 1, date: weekDate.toISOString(), user: 'alice' });
    consumptionLogs.push({ id: `c-${w}-2`, projectId: 'P-1002', materialId: 3, qty: 1, date: weekDate.toISOString(), user: 'bob' });
    if (w % 2 === 0) consumptionLogs.push({ id: `c-${w}-3`, projectId: 'P-1003', materialId: 2, qty: 8, date: weekDate.toISOString(), user: 'alice' });
  }

  const appointments = [
    { id: 1, projectType: 'Kitchen Remodel', preferredDate: new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString(), status: 'pending', assignedDesigner: 'claire' },
    { id: 2, projectType: 'Bathroom Refresh', preferredDate: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(), status: 'scheduled', assignedDesigner: 'claire' },
  ];

  const forecasts = [
    { id: 'f-1', materialId: 1, forecast: 5, period: 'next_4_weeks' },
  ];

  // Build a forecastResult object compatible with ForecastPage expectations
  const forecastSeries = consumptionLogs.map((c) => ({ date: c.date, value: c.qty }));
  const generatedAt = new Date().toISOString();
  const summary = 'Client-side simulated forecast. Replace with API results for production.';

  // Compute recommendations from `forecasts` array and inventory
  const recommendations: any[] = [];
  forecasts.forEach((f) => {
    const inv = inventory.find((i) => i.id === f.materialId);
    if (!inv) return;
    const forecastQty = Number(f.forecast) || 0;
    const stock = Number(inv.stock) || 0;
    const minStock = Number(inv.minStock) || 0;
    const qty = Math.max(0, Math.ceil(forecastQty - stock + minStock));
    if (qty > 0) recommendations.push({ item: inv.name, qty, materialId: inv.id, supplier: inv.supplier });
  });

  const forecastResult = {
    generatedAt,
    summary,
    series: forecastSeries,
    recommendations,
  };

  const inquiries = [
    { id: 'inq-1', name: 'Potential Client', email: 'lead@example.com', message: 'Interested in kitchen counters' },
  ];

  const auditLogs = [`${new Date().toLocaleString()}: Seeded sample data`] ;

  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('inventory', JSON.stringify(inventory));
  localStorage.setItem('projects', JSON.stringify(projects));
  localStorage.setItem('consumptionLogs', JSON.stringify(consumptionLogs));
  localStorage.setItem('appointments', JSON.stringify(appointments));
  localStorage.setItem('forecastHistory', JSON.stringify(forecasts));
  localStorage.setItem('forecastResult', JSON.stringify(forecastResult));
  localStorage.setItem('inquiries', JSON.stringify(inquiries));
  localStorage.setItem('auditLogs', JSON.stringify(auditLogs));

  return {
    users,
    inventory,
    projects,
    consumptionLogs,
    appointments,
    forecasts,
  };
}

export default seedSampleData;
