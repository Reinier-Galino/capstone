import { Outlet } from "react-router";
import { useEffect } from 'react';
import { ensureDefaultAccounts } from '../utils/auth';
import seedSampleData from '../utils/sampleData';

export function RootLayout() {
  useEffect(() => {
    ensureDefaultAccounts();
    // Auto-seed sample data on first run if core keys are missing
    const hasProjects = !!localStorage.getItem('projects');
    const hasInventory = !!localStorage.getItem('inventory');
    if (!hasProjects || !hasInventory) {
      seedSampleData();
    }

    // Patch existing projects to ensure they have local images and curator notes
    try {
      const raw = localStorage.getItem('projects');
      if (raw) {
        const projects = JSON.parse(raw);
        const base = import.meta.env.BASE_URL || '/';
        const imageMap: Record<string, string> = {
          'P-1001': `${base}images/p1.svg`,
          'P-1002': `${base}images/p2.svg`,
          'P-1003': `${base}images/p3.svg`,
        };
        let changed = false;
        const updated = projects.map((p: any) => {
          const copy = { ...p };
          // if missing or placeholder, assign a local sample image by id or by title keywords
          const needsImage = !copy.image || String(copy.image).includes('placeholder');
          if (needsImage) {
            const idKey = String(copy.id);
            if (imageMap[idKey]) {
              copy.image = imageMap[idKey];
              changed = true;
            } else if (copy.title && /kitchen/i.test(copy.title)) {
              copy.image = `${base}images/p1.svg`; changed = true;
            } else if (copy.title && /bathroom|bath/i.test(copy.title)) {
              copy.image = `${base}images/p2.svg`; changed = true;
            } else if (copy.title && /wardrobe|wardrobe|closet/i.test(copy.title)) {
              copy.image = `${base}images/p3.svg`; changed = true;
            }
          }
          if (!copy.curatorNote && copy.title) { copy.curatorNote = copy.title; changed = true; }
          if (!Array.isArray(copy.reviews)) { copy.reviews = copy.reviews || []; }
          return copy;
        });
        if (changed) localStorage.setItem('projects', JSON.stringify(updated));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Outlet />
    </div>
  );
}
