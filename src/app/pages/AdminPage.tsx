import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
import { InventoryDashboard } from "../components/InventoryDashboard";
import { NotificationPanel } from "../components/NotificationPanel";
import ProjectEditor from "../components/ProjectEditor";
import { getStoredUsers, saveStoredUsers, getAuditLogs, addAuditLog, hashPassword } from "../utils/auth";
import * as XLSX from 'xlsx';
import seedSampleData from '../utils/sampleData';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'notifications' | 'team' | 'projects'>('analytics');
  const [projects, setProjects] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'designer', specialization: '' });
  const [teamError, setTeamError] = useState('');

  useEffect(() => {
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    setAppointments(storedAppointments);

    const storedInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    if (storedInventory.length === 0) {
      const defaultInventory = [
        { id: 1, name: 'Quartz Countertops', category: 'Surfaces', stock: 15, minStock: 10, unit: 'slabs', supplier: 'Caesarstone', price: 12000, unitCost: 12000 },
        { id: 2, name: 'White Oak Lumber', category: 'Wood', stock: 45, minStock: 30, unit: 'board ft', supplier: 'Woodworkers Source', price: 25, unitCost: 25 },
        { id: 3, name: 'Carrara Marble', category: 'Surfaces', stock: 8, minStock: 5, unit: 'slabs', supplier: 'Stone Source NYC', price: 15000, unitCost: 15000 },
        { id: 4, name: 'Belgian Linen Fabric', category: 'Textiles', stock: 120, minStock: 80, unit: 'yards', supplier: 'The Shade Store', price: 45, unitCost: 45 },
        { id: 5, name: 'Soft-Close Hinges', category: 'Hardware', stock: 250, minStock: 200, unit: 'pieces', supplier: 'Blum', price: 6, unitCost: 6 },
        { id: 6, name: 'Zellige Tiles', category: 'Finishes', stock: 4, minStock: 10, unit: 'boxes', supplier: 'Clé Tile', price: 80, unitCost: 80 },
        { id: 7, name: 'Walnut Veneer', category: 'Wood', stock: 28, minStock: 20, unit: 'sheets', supplier: 'Certainly Wood', price: 200, unitCost: 200 },
        { id: 8, name: 'Brass Hardware', category: 'Hardware', stock: 180, minStock: 150, unit: 'pieces', supplier: 'Rejuvenation', price: 12, unitCost: 12 },
      ];
      localStorage.setItem('inventory', JSON.stringify(defaultInventory));
      setInventory(defaultInventory);
    } else {
      setInventory(storedInventory);
    }

    const storedUsers = getStoredUsers();
    if (!storedUsers || storedUsers.length === 0) {
      const seeded = [
        { username: 'supervisor', email: 'supervisor@mofil.local', passwordHash: hashPassword('Supervisor123!'), role: 'supervisor' },
        { username: 'staff', email: 'staff@mofil.local', passwordHash: hashPassword('Staff123!'), role: 'staff' },
      ];
      saveStoredUsers(seeded as any);
      setUsers(seeded as any);
    } else {
      setUsers(storedUsers || []);
    }
    setAuditLogs(getAuditLogs());
    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    setProjects(storedProjects);
  }, []);

  useEffect(() => {
    if (activeTab === 'team') {
      setAuditLogs(getAuditLogs());
      setUsers(getStoredUsers());
    }
  }, [activeTab]);

  const lowStockItems = inventory.filter(item => item.stock < item.minStock);
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  const updateAppointmentStatus = (appointmentId: number, status: string) => {
    const updatedAppointments = appointments.map((apt) =>
      apt.id === appointmentId ? { ...apt, status } : apt
    );
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    addAuditLog(`Appointment ${appointmentId} marked as ${status}`);
    setAuditLogs(getAuditLogs());
  };

  const createTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    if (!newUser.username || !newUser.email || !newUser.password) {
      setTeamError('All fields are required.');
      return;
    }
    if (users.some((user) => user.username === newUser.username || user.email === newUser.email)) {
      setTeamError('That username or email is already in use.');
      return;
    }

    const updatedUsers = [...users, {
      username: newUser.username,
      email: newUser.email,
      passwordHash: hashPassword(newUser.password),
      role: newUser.role,
      specialization: newUser.specialization,
    }];
    saveStoredUsers(updatedUsers);
    setUsers(updatedUsers);
    addAuditLog(`New ${newUser.role} account created: ${newUser.username}`);
    setAuditLogs(getAuditLogs());
    setNewUser({ username: '', email: '', password: '', role: 'designer', specialization: '' });
  };

  const downloadBackup = () => {
    const payload = {
      appointments,
      inventory,
      users,
      auditLogs,
      timestamp: new Date().toISOString(),
    };

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Function to convert array of objects to worksheet
    const createWorksheet = (data: any[], sheetName: string) => {
      if (!Array.isArray(data)) {
        data = [data];
      }
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    };

    // Create worksheets for each data section
    createWorksheet(payload.appointments, 'Appointments');
    createWorksheet(payload.inventory, 'Inventory');
    createWorksheet(payload.users, 'Users');

    // For audit logs, convert array of strings to objects
    const auditLogObjects = payload.auditLogs.map((log: string, index: number) => ({
      'Log Entry': log,
      'Index': index + 1
    }));
    createWorksheet(auditLogObjects, 'AuditLogs');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `mofil-backup-${new Date().toISOString().slice(0, 10)}.xlsx`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-16">
          <div className="mb-12">
            <h1
              className="text-[3.5rem] mb-4 tracking-[-0.03em]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Manage appointments, monitor inventory, and track business metrics.
            </p>
            <div className="mt-6">
              <button
                onClick={() => { seedSampleData(); window.location.reload(); }}
                className="px-6 py-3 bg-foreground text-foreground-foreground text-sm tracking-wide uppercase border border-foreground hover:bg-background hover:text-foreground transition-all duration-300"
              >
                Load Sample Data
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-12 border-b border-border">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-sm tracking-wide uppercase transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-foreground opacity-100'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-4 text-sm tracking-wide uppercase transition-all duration-300 relative ${
                activeTab === 'inventory'
                  ? 'border-b-2 border-foreground opacity-100'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              Inventory
              {lowStockItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {lowStockItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm tracking-wide uppercase transition-all duration-300 relative ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-foreground opacity-100'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              Notifications
              {(pendingAppointments.length + lowStockItems.length) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                  {pendingAppointments.length + lowStockItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-6 py-4 text-sm tracking-wide uppercase transition-all duration-300 ${
                activeTab === 'team'
                  ? 'border-b-2 border-foreground opacity-100'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-4 text-sm tracking-wide uppercase transition-all duration-300 ${
                activeTab === 'projects'
                  ? 'border-b-2 border-foreground opacity-100'
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              Projects
            </button>
          </div>

          <div className="flex justify-end gap-4 mb-8">
            <button
              onClick={downloadBackup}
              className="px-6 py-3 bg-secondary text-secondary-foreground text-sm tracking-wide uppercase border border-secondary hover:bg-background hover:text-foreground transition-all duration-300"
            >
              Download Excel Backup
            </button>
            <button
              onClick={() => { seedSampleData(); window.location.reload(); }}
              className="px-6 py-3 bg-foreground text-foreground-foreground text-sm tracking-wide uppercase border border-foreground hover:bg-background hover:text-foreground transition-all duration-300"
            >
              Load Sample Data
            </button>
          </div>

          {activeTab === 'analytics' && <AnalyticsDashboard appointments={appointments} inventory={inventory} onUpdateAppointment={updateAppointmentStatus} />}
          {activeTab === 'inventory' && <InventoryDashboard inventory={inventory} setInventory={setInventory} />}
          {activeTab === 'notifications' && (
            <NotificationPanel
              appointments={pendingAppointments}
              lowStockItems={lowStockItems}
            />
          )}
          {activeTab === 'team' && (
            <div className="space-y-8">
              <div className="border border-border p-8 rounded-3xl">
                <h2 className="text-[2rem] mb-4 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
                  Team Management
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Create designer user accounts to distribute access and operations.
                </p>
                <form onSubmit={createTeamMember} className="grid gap-6 md:grid-cols-[1fr_320px]">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs tracking-widest uppercase opacity-70">Full Name</label>
                        <input
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
                          placeholder="Username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs tracking-widest uppercase opacity-70">Email</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs tracking-widest uppercase opacity-70">Role</label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
                        >
                          <option value="designer">Designer</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="staff">Staff</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs tracking-widest uppercase opacity-70">Specialization</label>
                        <select
                          value={newUser.specialization}
                          onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
                        >
                          <option value="">Select specialization (optional)</option>
                          <optgroup label="Project Types">
                            <option value="Kitchen Design">Kitchen Design</option>
                            <option value="Cabinetry">Cabinetry</option>
                            <option value="Window Treatments">Window Treatments</option>
                            <option value="Bedroom Design">Bedroom Design</option>
                          </optgroup>
                          <optgroup label="Design Styles">
                            <option value="Modern Design">Modern Design</option>
                            <option value="Traditional Design">Traditional Design</option>
                            <option value="Contemporary Design">Contemporary Design</option>
                            <option value="Minimalist Design">Minimalist Design</option>
                            <option value="Luxury Design">Luxury Design</option>
                          </optgroup>
                          <optgroup label="Specialties">
                            <option value="Commercial Design">Commercial Design</option>
                            <option value="Residential Design">Residential Design</option>
                            <option value="Sustainable Design">Sustainable Design</option>
                            <option value="Custom Furniture">Custom Furniture</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs tracking-widest uppercase opacity-70">Temporary Password</label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
                          placeholder="Set password"
                        />
                      </div>
                    </div>
                    {teamError && (
                      <div className="px-4 py-3 bg-destructive/10 border border-destructive text-destructive text-sm">
                        {teamError}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-primary-foreground text-sm tracking-wide uppercase border border-primary hover:bg-background hover:text-foreground transition-all duration-300"
                    >
                      Add Team Member
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-border bg-muted/5 p-6">
                      <h3 className="text-lg mb-3 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
                        Active Team Members
                      </h3>
                      <ul className="space-y-3 text-sm">
                        {users.length > 0 ? (
                          users.map((user) => (
                            <li key={user.username} className="rounded-xl border border-border p-4 bg-background">
                              <div className="font-medium">{user.username}</div>
                              <div className="text-xs opacity-70">{user.email} · {user.role}</div>
                              {user.specialization && (
                                <div className="text-xs opacity-70 mt-1">Specialization: {user.specialization}</div>
                              )}
                            </li>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No team members created yet.</p>
                        )}
                      </ul>
                    </div>
                    <div className="rounded-3xl border border-border bg-muted/5 p-6">
                      <h3 className="text-lg mb-3 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
                        Latest Audit Logs
                      </h3>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        {auditLogs.length > 0 ? (
                          auditLogs.slice(0, 5).map((log, index) => (
                            <div key={index} className="rounded-xl bg-background border border-border p-3">
                              {log}
                            </div>
                          ))
                        ) : (
                          <p>No audit activity yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              <div className="border border-border p-8 rounded-3xl">
                <h2 className="text-[2rem] mb-4 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
                  Project Management
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Create and manage projects, define required materials and estimated work to enable operations tracking.</p>

                <ProjectEditor
                  projects={projects}
                  inventory={inventory}
                  onCreate={(p: any) => { const next = [p, ...projects]; setProjects(next); localStorage.setItem('projects', JSON.stringify(next)); }}
                  onUpdate={(p: any) => { const next = projects.map((pp:any) => pp.id === p.id ? p : pp); setProjects(next); localStorage.setItem('projects', JSON.stringify(next)); }}
                  onDelete={(id: any) => { const next = projects.filter((pp:any) => pp.id !== id); setProjects(next); localStorage.setItem('projects', JSON.stringify(next)); }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
