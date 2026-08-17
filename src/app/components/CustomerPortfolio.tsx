import { useState, useEffect } from "react";

interface Appointment {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  projectType: string;
  budget: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: string;
  createdAt: string;
  customerEmail?: string;
  customerUsername?: string;
}

export function CustomerPortfolio() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');

    const userAppointments = storedAppointments.filter((apt: any) =>
      apt.customerEmail === currentUser.email || apt.customerUsername === currentUser.username
    );

    setAppointments(userAppointments);
  }, []);

  const filteredAppointments = appointments.filter(apt =>
    activeFilter === 'all' ? true : apt.status === activeFilter
  );

  const totalSpent = appointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + parseFloat(apt.budget), 0);

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleRequestUpdate = (appointmentId: number) => {
    setStatusMessage('Your update request has been sent. We will notify you when the project status changes.');
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const handleCancelAppointment = (appointmentId: number) => {
    const updated = appointments.filter((apt) => apt.id !== appointmentId);
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    setStatusMessage('Appointment canceled successfully.');
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const closeDetailsModal = () => {
    setSelectedAppointment(null);
  };

  const projectTypeBreakdown = appointments.reduce((acc: any, apt) => {
    acc[apt.projectType] = (acc[apt.projectType] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="border-t border-border pt-20 mt-20">
      <div className="mb-16">
        <h2
          className="text-[3rem] mb-4 tracking-[-0.03em]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Your Portfolio
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          A curated timeline of your interior design journey with mofil—past consultations, ongoing projects, and future visions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="border border-border p-8">
          <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Total Projects</p>
          <p className="text-[2.5rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
            {appointments.length}
          </p>
        </div>

        <div className="border border-border p-8">
          <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Investment</p>
          <p className="text-[2.5rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
            ₱{totalSpent.toLocaleString()}
          </p>
        </div>

        <div className="border border-border p-8">
          <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Most Requested</p>
          <p className="text-[2.5rem] tracking-[-0.02em] capitalize" style={{ fontFamily: 'var(--font-serif)' }}>
            {Object.entries(projectTypeBreakdown).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '—'}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-8 border-b border-border pb-1">
        {(['all', 'pending', 'confirmed', 'completed'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 text-sm tracking-wide uppercase transition-all duration-300 ${
              activeFilter === filter
                ? 'border-b-2 border-foreground opacity-100'
                : 'opacity-50 hover:opacity-100'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="space-y-6">
          {filteredAppointments.map((apt, index) => {
            const date = new Date(apt.createdAt);
            const formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <article
                key={apt.id}
                className="border border-border hover:border-foreground transition-all duration-300 group"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-baseline gap-4 mb-2">
                        <h3
                          className="text-[1.75rem] tracking-[-0.02em]"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          Project #{appointments.length - index}
                        </h3>
                        <span className="text-xs tracking-widest uppercase opacity-50">
                          {formattedDate}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {apt.projectType.replace('-', ' ')} Design
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 text-xs tracking-wide uppercase border ${
                        apt.status === 'completed'
                          ? 'bg-accent/20 border-accent text-accent-foreground'
                          : apt.status === 'confirmed'
                          ? 'bg-secondary/20 border-secondary text-secondary-foreground'
                          : 'bg-muted border-border text-muted-foreground'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Budget</p>
                      <p className="text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
                       ₱{parseFloat(apt.budget).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Scheduled</p>
                      <p className="text-sm">{apt.preferredDate}</p>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Time</p>
                      <p className="text-sm capitalize">{apt.preferredTime}</p>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase opacity-50 mb-2">Location</p>
                      <p className="text-sm truncate">{apt.address}</p>
                    </div>
                  </div>

                  {apt.notes && (
                    <div className="pt-6 border-t border-border/50">
                      <p className="text-xs tracking-widest uppercase opacity-50 mb-3">Project Notes</p>
                      <p
                        className="text-sm leading-relaxed italic opacity-80"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        "{apt.notes}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/50 px-8 py-4 bg-muted/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(apt)}
                      className="text-xs tracking-wide uppercase opacity-70 hover:opacity-100 transition-opacity"
                    >
                      View Details
                    </button>
                    <span className="opacity-30">•</span>
                    <button
                      onClick={() => handleRequestUpdate(apt.id)}
                      className="text-xs tracking-wide uppercase opacity-70 hover:opacity-100 transition-opacity"
                    >
                      Request Update
                    </button>
                    {apt.status === 'pending' && (
                      <>
                        <span className="opacity-30">•</span>
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-xs tracking-wide uppercase opacity-70 hover:opacity-100 transition-opacity text-destructive"
                        >
                          Cancel Appointment
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <>
          {statusMessage && (
            <div className="mb-8 px-8 py-6 bg-secondary/10 border border-secondary text-secondary-foreground text-sm">
              {statusMessage}
            </div>
          )}
          <div className="border border-border p-20 text-center">
          <p className="text-muted-foreground mb-2">
            No {activeFilter !== 'all' ? activeFilter : ''} appointments found
          </p>
          <p className="text-sm opacity-60">
            {activeFilter !== 'all'
              ? 'Try selecting a different filter above'
              : 'Your project history will appear here once you book your first consultation'
            }
          </p>
        </div>
        </>
      )}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-background p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h3 className="text-[2rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
                  Appointment Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review the appointment details and project notes.
                </p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 border border-border text-sm uppercase tracking-wide hover:bg-muted/30 transition-colors duration-300"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="rounded-xl border border-border p-6">
                <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Client</p>
                <p className="font-medium">{selectedAppointment.fullName}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border p-6">
                  <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Email</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.email}</p>
                </div>
                <div className="rounded-xl border border-border p-6">
                  <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Phone</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.phone}</p>
                </div>
                <div className="rounded-xl border border-border p-6">
                  <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Status</p>
                  <p className="text-sm font-medium capitalize">{selectedAppointment.status}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-6">
                <p className="text-xs uppercase tracking-widest opacity-50 mb-3">Project Notes</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedAppointment.notes || 'No additional notes provided.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
