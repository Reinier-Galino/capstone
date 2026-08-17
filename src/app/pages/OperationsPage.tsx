import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { addAuditLog, getCurrentUser } from '../utils/auth';
// notifications removed from operations view per request

export function OperationsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [consumptionLogs, setConsumptionLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [assignSelection, setAssignSelection] = useState<Record<string, string>>({});

  useEffect(() => {
    setAppointments(JSON.parse(localStorage.getItem('appointments') || '[]'));
    setInventory(JSON.parse(localStorage.getItem('inventory') || '[]'));
    setProjects(JSON.parse(localStorage.getItem('projects') || '[]'));
    setConsumptionLogs(JSON.parse(localStorage.getItem('consumptionLogs') || '[]'));
    setUsers(JSON.parse(localStorage.getItem('users') || '[]'));
  }, []);

  const handleUpdateAppointment = (id: number, status: string) => {
    const all = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updated = all.map((apt: any) => apt.id === id ? { ...apt, status } : apt);
    localStorage.setItem('appointments', JSON.stringify(updated));
    setAppointments(updated);
  };

  // removed low-stock alerts in operations view

  // Compute project completion automatically
  const computeProjectCompletion = (project: any) => {
    // If project has explicit materialsRequired: [{materialId, qty}]
    if (Array.isArray(project.materialsRequired) && project.materialsRequired.length > 0) {
      const totals = project.materialsRequired.map((req: any) => {
        const consumed = consumptionLogs.filter((c: any) => String(c.projectId) === String(project.id) && String(c.materialId) === String(req.materialId)).reduce((s: number, x: any) => s + Number(x.qty || 0), 0);
        const pct = req.qty > 0 ? Math.min(1, consumed / req.qty) : 0;
        return pct;
      });
      const avg = totals.length > 0 ? (totals.reduce((s: number, v: number) => s + v, 0) / totals.length) : 0;
      return Math.round(avg * 100);
    }

    // If project has estimatedWork (number of expected consumption events)
    if (project.estimatedWork && Number(project.estimatedWork) > 0) {
      const done = consumptionLogs.filter((c: any) => String(c.projectId) === String(project.id)).length;
      return Math.round(Math.min(100, (done / Number(project.estimatedWork)) * 100));
    }

    // Fallback: use ratio of distinct consumed materials vs average materials count across projects that have materialsRequired
    const projectsWithReq = projects.filter((p: any) => Array.isArray(p.materialsRequired) && p.materialsRequired.length > 0);
    const avgReqCount = projectsWithReq.length > 0 ? projectsWithReq.reduce((s: number, p: any) => s + p.materialsRequired.length, 0) / projectsWithReq.length : 0;
    if (avgReqCount > 0) {
      const distinctConsumed = new Set(consumptionLogs.filter((c: any) => String(c.projectId) === String(project.id)).map((c: any) => String(c.materialId))).size;
      return Math.round(Math.min(100, (distinctConsumed / avgReqCount) * 100));
    }

    // No data available
    return 0;
  };

  const projectProgress = projects.map((p: any) => ({ id: p.id || p.title, title: p.title || `#${p.id}`, completion: computeProjectCompletion(p) }));

  const computeBOMCost = (project: any) => {
    if (!Array.isArray(project.materialsRequired)) return 0;
    return project.materialsRequired.reduce((sum: number, req: any) => {
      const mat = inventory.find((i: any) => String(i.id) === String(req.materialId));
      const price = mat?.price ?? mat?.unitCost ?? 0;
      return sum + (Number(req.qty || 0) * Number(price || 0));
    }, 0);
  };

  // Workforce deployment: count tasks per staff (using consumptionLogs.user or appointments.assignedDesigner)
  const staff = users.filter((u: any) => u.role === 'staff' || u.role === 'supervisor');
  const staffDeployment = staff.map((s: any) => {
    const tasks = consumptionLogs.filter((c: any) => String(c.user || '') === String(s.username)).length;
    const assignedAppointments = appointments.filter((a: any) => a.assignedDesigner === s.username).length;
    const assignedProjects = projects.filter((p: any) => String(p.assignedStaff || '') === String(s.username)).length;
    return { username: s.username, tasks, assignedAppointments, assignedProjects };
  });

  const autoDeployToProject = (proj: any) => {
    if (staff.length === 0) return;
    // pick least loaded by assignedProjects, then tasks, then appointments
    const sorted = staffDeployment.slice().sort((a: any, b: any) => {
      if (a.assignedProjects !== b.assignedProjects) return a.assignedProjects - b.assignedProjects;
      if (a.tasks !== b.tasks) return a.tasks - b.tasks;
      return a.assignedAppointments - b.assignedAppointments;
    });
    const pick = sorted[0];
    if (!pick) return;
    const username = pick.username;
    const next = projects.map((p: any) => p.id === proj.id ? { ...p, assignedStaff: username } : p);
    setProjects(next);
    localStorage.setItem('projects', JSON.stringify(next));
    const actor = getCurrentUser()?.username || 'system';
    addAuditLog(`${actor} auto-deployed ${username} to project ${proj.title || proj.id}`);
  };

  // Delivery schedules: use appointments with preferredDate
  const upcomingDeliveries = appointments
    .filter((a: any) => a.preferredDate)
    .map((a: any) => ({ id: a.id, project: a.projectType, date: a.preferredDate, status: a.status }))
    .sort((x: any, y: any) => new Date(x.date).getTime() - new Date(y.date).getTime())
    .slice(0, 10);

  return (
    <>
      <Header />
      <main className="max-w-[1200px] mx-auto px-8 lg:px-16 py-32 space-y-12">
        <section className="border border-border p-8">
          <h2 className="text-[2rem] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Project Operations Monitoring</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg mb-4">Project Completion</h3>
              {projectProgress.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((proj: any) => {
                    const completion = computeProjectCompletion(proj);
                    const assigned = proj.assignedStaff || '';
                    return (
                      <div key={proj.id}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <div className="text-sm">{proj.title || `#${proj.id}`}</div>
                            <div className="text-xs text-muted-foreground">Estimated BOM: ₱{Number(computeBOMCost(proj)).toLocaleString()}</div>
                          </div>
                          <div className="text-xs opacity-70">{completion}%</div>
                        </div>
                        <div className="w-full bg-muted/30 h-3 rounded-full overflow-hidden">
                          <div style={{ width: `${Math.max(0, Math.min(100, completion))}%` }} className="h-3 bg-primary"></div>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="text-xs text-muted-foreground">Assigned:</div>
                          <div className="text-sm font-medium">{assigned || '—'}</div>

                          <select
                            value={assignSelection[proj.id] ?? assigned}
                            onChange={(e) => setAssignSelection((s) => ({ ...s, [proj.id]: e.target.value }))}
                            className="px-3 py-2 border border-border bg-input-background text-sm"
                          >
                            <option value="">Unassigned</option>
                            {staff.map((s: any) => (
                              <option key={s.username} value={s.username}>{s.username}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => {
                              const username = assignSelection[proj.id] ?? assigned ?? '';
                              const next = projects.map((p: any) => p.id === proj.id ? { ...p, assignedStaff: username } : p);
                              setProjects(next);
                              localStorage.setItem('projects', JSON.stringify(next));
                              const actor = getCurrentUser()?.username || 'system';
                              addAuditLog(`${actor} assigned ${username || 'Unassigned'} to project ${proj.title || proj.id}`);
                            }}
                            className="px-3 py-2 bg-secondary text-secondary-foreground text-xs rounded"
                          >
                            Deploy
                          </button>

                          <button
                            onClick={() => autoDeployToProject(proj)}
                            className="px-3 py-2 bg-foreground text-foreground-foreground text-xs rounded"
                          >
                            Auto-Deploy
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No projects found</p>
              )}
            </div>

            <div>
              <h3 className="text-lg mb-4">Workforce Deployment</h3>
              {staffDeployment.length > 0 ? (
                <div className="space-y-3">
                  {staffDeployment.map((s: any) => (
                    <div key={s.username} className="flex items-center justify-between border-b border-border/50 py-2">
                      <div>
                        <div className="font-medium">{s.username}</div>
                        <div className="text-xs text-muted-foreground">Assigned appointments: {s.assignedAppointments}</div>
                      </div>
                      <div className="text-sm">Tasks: {s.tasks}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No staff users configured</p>
              )}

              <h3 className="text-lg mt-8 mb-4">Upcoming Deliveries</h3>
              {upcomingDeliveries.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDeliveries.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between border-b border-border/50 py-2">
                      <div>
                        <div className="font-medium">{d.project}</div>
                        <div className="text-xs text-muted-foreground">{new Date(d.date).toLocaleString()}</div>
                      </div>
                      <div className="text-sm uppercase opacity-70">{d.status || 'scheduled'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No upcoming deliveries</p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
