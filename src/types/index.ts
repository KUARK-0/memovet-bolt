export interface Medication {
  id: string;
  name: string;
  stock: number;
  criticalLimit: number;
  unit: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalAnimals: number;
  debt: number;
}

export interface Visit {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  summary: string;
  totalCost: number;
  medications: { medicationId: string; quantity: number }[];
}
