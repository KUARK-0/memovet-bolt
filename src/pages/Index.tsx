import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Medication, Visit } from '../types';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import ClientsPanel from '../components/ClientsPanel';
import MedicationsPanel from '../components/MedicationsPanel';
import VisitsPanel from '../components/VisitsPanel';
import IncomePanel from '../components/IncomePanel';
import AIAssistant from '../components/AIAssistant';
import ThemeToggle from '../components/ThemeToggle';

const generateId = () => Math.random().toString(36).substring(2, 9);

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useLocalStorage<Client[]>('memovet-clients', []);
  const [medications, setMedications] = useLocalStorage<Medication[]>('memovet-medications', []);
  const [visits, setVisits] = useLocalStorage<Visit[]>('memovet-visits', []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addClient = (client: Omit<Client, 'id'>) => {
    setClients(prev => [...prev, { ...client, id: generateId() }]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addMedication = (medication: Omit<Medication, 'id'>) => {
    setMedications(prev => [...prev, { ...medication, id: generateId() }]);
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const addVisit = (visit: Omit<Visit, 'id'>) => {
    setVisits(prev => [{ ...visit, id: generateId() }, ...prev]);
  };

  const deleteVisit = (id: string) => {
    setVisits(prev => prev.filter(v => v.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'clients':
        return (
          <ClientsPanel
            clients={clients}
            onAdd={addClient}
            onUpdate={updateClient}
            onDelete={deleteClient}
          />
        );
      case 'medications':
        return (
          <MedicationsPanel
            medications={medications}
            onAdd={addMedication}
            onUpdate={updateMedication}
            onDelete={deleteMedication}
          />
        );
      case 'visits':
        return (
          <VisitsPanel
            visits={visits}
            clients={clients}
            onAdd={addVisit}
            onDelete={deleteVisit}
          />
        );
      case 'income':
        return <IncomePanel visits={visits} />;
      case 'assistant':
        return <AIAssistant />;
      default:
        return (
          <Dashboard
            medications={medications}
            clients={clients}
            visits={visits}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 overflow-x-hidden">
        <div className="md:hidden flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
