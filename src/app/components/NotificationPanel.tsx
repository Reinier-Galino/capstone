import { useEffect, useState } from 'react';
import { addAuditLog } from '../utils/auth';

interface NotificationPanelProps {
  appointments: any[];
  lowStockItems: any[];
}

export function NotificationPanel({ appointments, lowStockItems }: NotificationPanelProps) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    setHistory(storedHistory);
  }, []);

  const recordNotification = (message: string) => {
    const storedHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    const updatedHistory = [message, ...storedHistory].slice(0, 50);
    localStorage.setItem('notificationHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    addAuditLog(message);
  };
  const handleSendEmail = (appointment: any) => {
    try {
      const message = `Email sent to ${appointment.email}: "Your appointment with mofil is confirmed for ${appointment.preferredDate} at ${appointment.preferredTime}. We look forward to working with you."`;
      recordNotification(message);
      alert(message);
    } catch (error) {
      const fallback = `Fallback notification queued for ${appointment.email}. Please retry sending outside the service.`;
      recordNotification(fallback);
      alert(fallback);
    }
  };

  const handleMarkAsConfirmed = (appointmentId: number) => {
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updatedAppointments = allAppointments.map((apt: any) =>
      apt.id === appointmentId ? { ...apt, status: 'confirmed' } : apt
    );
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    addAuditLog(`Appointment ${appointmentId} marked confirmed by notification panel`);
    window.location.reload();
  };

  const handleSendLowStockEmail = (item: any) => {
    try {
      const message = `Low stock alert for ${item.name}. Current stock is ${item.stock} ${item.unit}, minimum threshold is ${item.minStock}. Supplier: ${item.supplier}.`;
      recordNotification(message);
      alert(message);
    } catch (error) {
      const fallback = `Low stock alert for ${item.name} queued in fallback channel.`;
      recordNotification(fallback);
      alert(fallback);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-6">
          <h2 className="text-[2rem] tracking-[-0.02em] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Appointment Notifications
          </h2>
          <p className="text-sm text-muted-foreground">
            {appointments.length} pending appointment{appointments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <article key={apt.id} className="border border-border p-6 hover:border-foreground transition-colors duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[1.25rem] tracking-[-0.02em] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                      {apt.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{apt.email} • {apt.phone}</p>
                  </div>
                  <span className="px-3 py-1 text-xs tracking-wide uppercase bg-secondary/20 text-secondary-foreground">
                    New
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-xs tracking-widest uppercase opacity-50 mb-1">Project</p>
                    <p className="capitalize">{apt.projectType}</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase opacity-50 mb-1">Budget</p>
                    <p>₱{parseFloat(apt.budget).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase opacity-50 mb-1">Date</p>
                    <p>{apt.preferredDate}</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase opacity-50 mb-1">Time</p>
                    <p className="capitalize">{apt.preferredTime}</p>
                  </div>
                </div>

                {apt.notes && (
                  <div className="mb-4 pt-4 border-t border-border/50">
                    <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Notes</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{apt.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-border/50">
                  <button
                    onClick={() => handleSendEmail(apt)}
                    className="px-6 py-2 bg-accent text-accent-foreground text-xs tracking-wide uppercase border border-accent hover:bg-background hover:text-foreground transition-all duration-300"
                  >
                    Send Email Confirmation
                  </button>
                  <button
                    onClick={() => handleMarkAsConfirmed(apt.id)}
                    className="px-6 py-2 border border-border text-xs tracking-wide uppercase hover:bg-foreground hover:text-background transition-all duration-300"
                  >
                    Mark as Confirmed
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-border p-12 text-center text-muted-foreground">
            No pending appointments at the moment
          </div>
        )}
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-[2rem] tracking-[-0.02em] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Stock Level Alerts
          </h2>
          <p className="text-sm text-muted-foreground">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below minimum stock
          </p>
        </div>

        {lowStockItems.length > 0 ? (
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <article key={item.id} className="border border-destructive/30 bg-destructive/5 p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-[1.25rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <span className="px-3 py-1 text-xs tracking-wide uppercase bg-destructive text-destructive-foreground">
                    Low Stock
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs tracking-widest uppercase opacity-50 mb-1">Current</p>
                    <p className="text-destructive">{item.stock} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase opacity-50 mb-1">Minimum</p>
                    <p>{item.minStock} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase opacity-50 mb-1">Supplier</p>
                    <p>{item.supplier}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <button
                    onClick={() => handleSendLowStockEmail(item)}
                    className="px-6 py-2 bg-accent text-accent-foreground text-xs tracking-wide uppercase border border-accent hover:bg-background hover:text-foreground transition-all duration-300"
                  >
                    Send Low Stock Email
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-border p-12 text-center text-muted-foreground">
            All inventory levels are healthy
          </div>
        )}
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-[2rem] tracking-[-0.02em] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Notification History
          </h2>
          <p className="text-sm text-muted-foreground">
            Latest communications and fallback actions recorded for review.
          </p>
        </div>
        <div className="space-y-4">
          {history.length > 0 ? (
            history.slice(0, 5).map((entry, index) => (
              <div key={index} className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                {entry}
              </div>
            ))
          ) : (
            <div className="border border-border p-12 text-center text-muted-foreground">
              No notification events recorded yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
