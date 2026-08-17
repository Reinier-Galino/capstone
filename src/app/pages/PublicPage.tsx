import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProjectGallery } from '../components/ProjectGallery';
import { useState, useEffect } from 'react';
import { getStoredUsers, addAuditLog } from '../utils/auth';

interface InquiryState { name: string; email: string; message: string; projectId?: number | '' }

export function PublicPage() {
  const [inquiry, setInquiry] = useState<InquiryState>({ name: '', email: '', message: '', projectId: '' });
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('projects') || '[]');
    setProjects(p);
  }, []);

  const submit = (e: any) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const next = [{ ...inquiry, id: Date.now(), createdAt: new Date().toISOString() }, ...stored];
    localStorage.setItem('inquiries', JSON.stringify(next));
    addAuditLog(`Public inquiry submitted${inquiry.projectId ? ' for project ' + inquiry.projectId : ''}`);

    // send email via mailto to admin if available
    const users = getStoredUsers();
    const admin = users.find(u => u.role === 'admin') || users.find(u => u.role === 'supervisor');
    const adminEmail = admin?.email || 'admin@mofil.local';
    const subject = encodeURIComponent(inquiry.projectId ? `Inquiry about project ${inquiry.projectId}` : 'General Inquiry');
    const body = encodeURIComponent(`${inquiry.message}\n\nFrom: ${inquiry.name} <${inquiry.email}>`);
    window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;

    setInquiry({ name: '', email: '', message: '', projectId: '' });
  };

  return (
    <>
      <Header />
      <main>
        {/* Hero sample project image */}
        <section className="max-w-[1200px] mx-auto px-8 lg:px-16 pt-24 pb-8">
          {(() => {
            const sample = (projects && projects.length > 0) ? projects[0] : { image: '/images/p1.svg', title: 'Sample Project', description: 'Featured work' };
            const src = sample.image || '/images/placeholder.svg';
            return (
              <div className="mb-10 border border-border overflow-hidden rounded">
                <img src={src} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder.svg'; }} alt={sample.title} className="w-full h-80 object-cover" />
                <div className="p-6">
                  <h2 className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>{sample.title}</h2>
                  <p className="text-sm text-muted-foreground">{sample.description}</p>
                </div>
              </div>
            );
          })()}
        </section>

        <ProjectGallery />

        <section className="max-w-[1200px] mx-auto px-8 lg:px-16 py-12">
          <h2 className="text-lg mb-4">Send an Inquiry</h2>
          <form onSubmit={submit} className="space-y-4 max-w-xl">
            <select value={inquiry.projectId ?? ''} onChange={(e) => setInquiry({ ...inquiry, projectId: e.target.value ? Number(e.target.value) : '' })} className="w-full px-4 py-3 border">
              <option value="">General Inquiry</option>
              {projects.map(p => (<option key={p.id} value={p.id}>{p.title}</option>))}
            </select>
            <input value={inquiry.name} onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })} placeholder="Name" className="w-full px-4 py-3 border" />
            <input value={inquiry.email} onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })} placeholder="Email" className="w-full px-4 py-3 border" />
            <textarea value={inquiry.message} onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })} placeholder="Message" className="w-full px-4 py-3 border" />
            <button className="px-6 py-3 bg-primary text-primary-foreground">Submit</button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
