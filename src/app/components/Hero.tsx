import { Link } from 'react-router';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-16 py-40 flex items-center gap-12">
        <div className="max-w-2xl">
          <h1 className="text-[4rem] md:text-[5rem] leading-tight mb-6 tracking-[-0.03em]" style={{ fontFamily: 'var(--font-serif)' }}>
            Materials intelligence for smarter projects
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Manage inventory, forecast demand, monitor operations, and generate BOMs — all from a single operational console built for project teams.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/inventory" className="px-8 py-4 bg-primary text-primary-foreground">Open Inventory</Link>
            <Link to="/public" className="px-8 py-4 border">View Projects</Link>
          </div>
        </div>

        <div className="hidden md:block flex-1">
          <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1593136573819-c3b57b8caf29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
              alt="Featured project"
              className="w-full h-[420px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
