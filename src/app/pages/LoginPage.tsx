import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Header } from "../components/Header";
import { getStoredUsers, hashPassword, setCurrentUser } from "../utils/auth";

const DEFAULT_USERS = [
  { username: "admin", password: "Admin@2026!Mofil", role: "admin", path: "/analytics" },
  { username: "supervisor", password: "super123", role: "supervisor", path: "/operations" },
  { username: "staff", password: "staff123", role: "staff", path: "/inventory" },
] as const;

export function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const match = DEFAULT_USERS.find((user) =>
      (user.username === formData.identifier || user.username === formData.identifier.toLowerCase()) &&
      user.password === formData.password
    );

    if (match) {
      setCurrentUser({ username: match.username, role: match.role });
      navigate(match.path);
      return;
    }

    const hashedPassword = hashPassword(formData.password);
    const storedUsers = getStoredUsers();
    const user = storedUsers.find((u: any) =>
      (u.username === formData.identifier || u.email === formData.identifier) && u.passwordHash === hashedPassword
    );

    if (user) {
      setCurrentUser({ username: user.username, email: user.email, role: user.role });
      if (user.role === 'admin') {
        navigate('/analytics');
      } else if (user.role === 'designer') {
        navigate('/designer');
      } else if (user.role === 'supervisor') {
        navigate('/operations');
      } else if (user.role === 'staff') {
        navigate('/inventory');
      } else {
        navigate('/customer');
      }
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="max-w-md mx-auto px-8">
          <div className="mb-12">
            <h1
              className="text-[3rem] mb-4 tracking-[-0.03em]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Welcome Back
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Access your account to manage appointments and explore our services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="px-6 py-4 bg-destructive/10 border border-destructive text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm tracking-wide uppercase opacity-70">
                Email or Username
              </label>
              <input
                type="text"
                required
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                className="w-full px-6 py-4 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
                placeholder="Enter your email or username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm tracking-wide uppercase opacity-70">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-6 py-4 bg-input-background border border-border outline-none focus:border-foreground transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-primary text-primary-foreground text-sm tracking-wide uppercase border border-primary hover:bg-background hover:text-foreground transition-all duration-300"
            >
              Log In
            </button>
          </form>

          <div className="mt-8 text-sm text-center opacity-70 space-y-2">
            <p>
              For access, contact your administrator.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
