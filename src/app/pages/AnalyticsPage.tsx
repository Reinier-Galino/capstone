import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

export function AnalyticsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [consumptionLogs, setConsumptionLogs] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);

  useEffect(() => {
    setAppointments(JSON.parse(localStorage.getItem('appointments') || '[]'));
    setInventory(JSON.parse(localStorage.getItem('inventory') || '[]'));
    setUsers(JSON.parse(localStorage.getItem('users') || '[]'));
    setProjects(JSON.parse(localStorage.getItem('projects') || '[]'));
    setConsumptionLogs(JSON.parse(localStorage.getItem('consumptionLogs') || '[]'));
    setInquiries(JSON.parse(localStorage.getItem('inquiries') || '[]'));
    setForecasts(JSON.parse(localStorage.getItem('forecastHistory') || '[]'));
  }, []);

  return (
    <>
      <Header />
      <main className="max-w-[1200px] mx-auto px-8 lg:px-16 py-32">
        <AnalyticsDashboard
          appointments={appointments}
          inventory={inventory}
          users={users}
          projects={projects}
          consumptionLogs={consumptionLogs}
          inquiries={inquiries}
          forecasts={forecasts}
        />
      </main>
      <Footer />
    </>
  );
}
