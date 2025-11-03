// types/index.ts

// Defines an unavailability period for a villa
export interface Unavailability {
  _id?: string;
  startDate: string;
  endDate: string;
}

// Defines the main Villa data structure
export interface Villa {
  _id: string;
  title: string;
  description: string;
  address: string;
  photos: string[];
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  guests: number; // ← REQUIRED - max guests allowed (remove the ?)
  amenities: { [key: string]: boolean };
  isAvailable: boolean;
  unavailability: Unavailability[];
  host: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Defines a single item in the shopping cart
export interface CartItem {
  _id: string;
  villa: Villa;
  checkIn: string;
  checkOut: string;
  guests: number;
  price: number;
}

// User interface for authentication
export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  userType?: 'user' | 'host'; // <-- FIX: Replaced [key: string]: any
  phone?: string;             // <-- FIX: Added other known optional properties
}