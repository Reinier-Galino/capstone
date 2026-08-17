import { useState, useEffect } from "react";
import { addAuditLog } from '../utils/auth';

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  curatorNote: string;
  materialsRequired?: { materialId: number; qty: number }[];
  ratings?: number[];
  reviews?: { name?: string; rating: number; text?: string; createdAt: string }[];
}

const defaultProjects: Project[] = [
  {
    id: 1,
    title: "Understated Elegance",
    category: "Kitchen Design",
    description: "A modern kitchen that balances warmth with precision, featuring custom millwork and thoughtful material selection.",
    image: "/images/p1.svg",
    curatorNote: "The restraint here speaks volumes—every detail considered, nothing superfluous."
  },
  {
    id: 2,
    title: "Layered Light",
    category: "Kitchen Design",
    description: "Where natural light meets carefully curated fixtures, creating an environment of calm sophistication.",
    image: "/images/p2.svg",
    curatorNote: "Notice how shadow becomes as important as light in defining the space."
  },
  {
    id: 3,
    title: "Material Dialogue",
    category: "Kitchen Design",
    description: "A contemporary space where wood, stone, and metal converse through texture and tone.",
    image: "/images/p3.svg",
    curatorNote: "The interplay of materials here creates a visual rhythm that's both dynamic and harmonious."
  }
];

export function ProjectGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('projects') || 'null');
      if (stored && Array.isArray(stored) && stored.length > 0) {
        // ensure stored projects have images (map missing to local samples)
        const imageMap: Record<string, string> = { 'P-1001': '/images/p1.svg', 'P-1002': '/images/p2.svg', 'P-1003': '/images/p3.svg' };
        const patched = stored.map((p: any) => {
          const copy = { ...p };
          const needs = !copy.image || String(copy.image).includes('placeholder');
          if (needs) {
            const idKey = String(copy.id);
            if (imageMap[idKey]) copy.image = imageMap[idKey];
            else if (copy.title && /kitchen/i.test(copy.title)) copy.image = '/images/p1.svg';
            else if (copy.title && /bathroom|bath/i.test(copy.title)) copy.image = '/images/p2.svg';
            else if (copy.title && /wardrobe|closet/i.test(copy.title)) copy.image = '/images/p3.svg';
            else copy.image = '/images/placeholder.svg';
          }
          return copy;
        });
        return patched;
      }
      return defaultProjects;
    } catch (e) {
      return defaultProjects;
    }
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [inventoryCache, setInventoryCache] = useState<any[]>([]);
  const placeholderImage = '/images/placeholder.svg';

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('projects') || 'null');
    if (!existing) {
      localStorage.setItem('projects', JSON.stringify(defaultProjects));
    }
    const inv = JSON.parse(localStorage.getItem('inventory') || '[]');
    setInventoryCache(inv);
  }, []);

  const saveProjects = (next: Project[]) => {
    setProjects(next);
    localStorage.setItem('projects', JSON.stringify(next));
  };

  const averageRating = (p: Project) => {
    if (!Array.isArray(p.ratings) || p.ratings.length === 0) return 0;
    return Math.round((p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length) * 10) / 10;
  };

  const submitRating = (projectId: number, value: number) => {
    const next = projects.map(p => {
      if (p.id !== projectId) return p;
      const ratings = Array.isArray(p.ratings) ? [...p.ratings, value] : [value];
      return { ...p, ratings };
    });
    saveProjects(next);
    addAuditLog(`Public rated project ${projectId} with ${value} stars`);
    alert('Thanks for your rating!');
  };

  const submitReview = (projectId: number, name: string, rating: number, text: string) => {
    const next = projects.map(p => {
      if (p.id !== projectId) return p;
      const reviews = Array.isArray(p.reviews) ? [{ name, rating, text, createdAt: new Date().toISOString() }, ...p.reviews] : [{ name, rating, text, createdAt: new Date().toISOString() }];
      return { ...p, reviews };
    });
    saveProjects(next);
    addAuditLog(`Public left a review for project ${projectId} (${rating}★)`);
    alert('Thank you for your review!');
  };

  const inquireAbout = (project: Project) => {
    // save an inquiry and open mail client to admin
    const adminUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const adminEmail = (adminUsers.find((u: any) => u.role === 'admin') || adminUsers.find((u: any) => u.role === 'supervisor') || {}).email || 'admin@mofil.local';
    const subject = encodeURIComponent(`Inquiry about project: ${project.title}`);
    const body = encodeURIComponent(`Hello,%0D%0A%0D%0AI am interested in your project "${project.title}" (ID: ${project.id}). Please provide more information.%0D%0A%0D%0ARegards.`);
    const stored = JSON.parse(localStorage.getItem('inquiries') || '[]');
    const next = [{ id: Date.now(), projectId: project.id, projectTitle: project.title, name: '', email: '', message: 'Inquiry via project gallery', createdAt: new Date().toISOString() }, ...stored];
    localStorage.setItem('inquiries', JSON.stringify(next));
    addAuditLog(`Public inquiry created for project ${project.id}`);
    window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="max-w-[1600px] mx-auto px-8 lg:px-16 py-32">
      <div className="mb-12">
        <h2 className="text-[3rem] md:text-[4rem] mb-4 tracking-[-0.03em]" style={{ fontFamily: 'var(--font-serif)' }}>
          Selected Works
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          A curated archive of spaces where intention meets execution—from bespoke kitchens to refined details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
        {projects.map((project) => (
          <article key={project.id} className="group cursor-pointer" onMouseEnter={() => setHoveredId(project.id)} onMouseLeave={() => setHoveredId(null)}>
            <div className="relative overflow-hidden border border-border mb-6 aspect-[4/5]">
              <img onClick={() => setSelectedProject(project)} src={project.image || placeholderImage} onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImage; }} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 ease-out" style={{ transform: hoveredId === project.id ? 'scale(1.05)' : 'scale(1)' }} />
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[1.5rem] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>{project.title}</h3>
                <span className="text-xs tracking-widest uppercase opacity-50 whitespace-nowrap">{project.category}</span>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm italic opacity-70 leading-relaxed" style={{ fontFamily: 'var(--font-serif)' }}>
                  "{project.curatorNote}"
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Rating:</span> <span className="ml-2">{averageRating(project)} ⭐</span>
                    <span className="ml-2 text-xs text-muted-foreground">({(project.ratings || []).length} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map((v) => (
                      <button key={v} onClick={() => submitRating(project.id, v)} className="px-2 py-1 border text-xs">{v}★</button>
                    ))}
                    <button onClick={() => inquireAbout(project)} className="px-3 py-1 border">Inquire</button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background max-w-3xl w-full p-6 rounded shadow-lg">
            <div className="flex justify-between items-start">
              <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>{selectedProject.title}</h3>
              <button onClick={() => setSelectedProject(null)} className="text-sm px-3 py-1 border">Close</button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img src={selectedProject.image || placeholderImage} onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImage; }} className="w-full h-72 object-cover" />
              </div>
              <div>
                <p className="mb-2 text-muted-foreground">{selectedProject.category}</p>
                <p className="mb-4">{selectedProject.description}</p>
                <h4 className="font-medium mb-2">Materials</h4>
                <ul className="list-disc pl-6 mb-4">
                  {(selectedProject.materialsRequired || []).map((m, idx) => {
                    const inv = inventoryCache.find(i => i.id === m.materialId);
                    return <li key={idx}>{inv ? inv.name : `Material ${m.materialId}`}: {m.qty} {inv?.unit || ''}</li>;
                  })}
                </ul>
                <div className="text-sm italic">"{selectedProject.curatorNote}"</div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Recent Reviews</h4>
                  {(selectedProject.reviews && selectedProject.reviews.length > 0) ? (
                    <div className="space-y-3 mb-4">
                      {selectedProject.reviews.slice(0,5).map((r, i) => (
                        <div key={i} className="p-3 border rounded">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{r.name || 'Anonymous'}</div>
                            <div className="text-sm">{r.rating}★</div>
                          </div>
                          <div className="text-sm text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
                          <p className="mt-2">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground mb-4">No reviews yet.</div>
                  )}

                  <h4 className="font-medium mb-2">Leave a Review</h4>
                  <ReviewForm projectId={selectedProject.id} onSubmit={(name, rating, text) => submitReview(selectedProject.id, name, rating, text)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ReviewForm({ projectId, onSubmit }: { projectId: number; onSubmit: (name: string, rating: number, text: string) => void }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(name || 'Anonymous', rating, text); setName(''); setRating(5); setText(''); }} className="space-y-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="w-full px-3 py-2 border" />
      <div className="flex gap-2">
        <label className="text-sm">Rating</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="px-2 py-1 border">
          {[5,4,3,2,1].map(v => <option key={v} value={v}>{v}★</option>)}
        </select>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your review" className="w-full px-3 py-2 border" />
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-primary text-primary-foreground">Submit Review</button>
      </div>
    </form>
  );
}
