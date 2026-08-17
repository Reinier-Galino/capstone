import { FormEvent, useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      return;
    }
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="border-t border-border mt-32">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-16">
        <div className="py-24 grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="max-w-xl">
              <h3 className="text-[1.25rem] mb-4 tracking-[-0.02em]" style={{ fontFamily: 'var(--font-serif)' }}>
                Operational Console
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                This interface focuses on inventory, forecasting, operations, workforce, and analytics for internal users only.
              </p>
            </div>

          <div className="grid grid-cols-2 gap-8 lg:gap-16 lg:justify-end">
            <div>
              <h4 className="text-sm tracking-wide uppercase mb-6 opacity-50">
                Company
              </h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">About</a></li>
                <li><a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Projects</a></li>
                <li><a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Services</a></li>
                <li><a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm tracking-wide uppercase mb-6 opacity-50">
                Follow
              </h4>
              <ul className="space-y-3">
                <li><a href="https://www.instagram.com/mofil_corp?fbclid=IwY2xjawRfHYBleHRuA2FlbQIxMABicmlkETE4MFdGZzk3dURjbFRaR1lIc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHklt6S7cMlkDUpUA-zJ0Rrl1u9xFUSHWZEDA00mCPQfD-87zNtv1xjnIjia3_aem_ie3kTjwhk6gqMOEq2ItSJQ" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Instagram</a></li>
                <li><a href="https://www.facebook.com/mofil09" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Facebook</a></li>
                <li><a href="#" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Tiktok</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs tracking-wide opacity-50">
            © 2026 mofil. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs tracking-wide opacity-50 hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="text-xs tracking-wide opacity-50 hover:opacity-100 transition-opacity">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
