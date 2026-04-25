export type UserRole = 'rider' | 'driver';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  timestamp?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  currentLocation?: Location;
  isActive?: boolean;
  activeRideId?: string | null;
}

export type RideStatus = 'requested' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';

export interface Ride {
  id: string;
  riderId: string;
  riderName: string;
  driverId?: string | null;
  driverName?: string | null;
  pickup: Location;
  destination: Location;
  status: RideStatus;
  price: number;
  createdAt: any; // Firestore timestamp
  updatedAt?: any;
}
