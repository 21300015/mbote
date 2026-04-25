const GATEWAY_URL = 'http://localhost:8080/api';

export interface RideRequest {
  riderId: string;
  riderName: string;
  pickup: { lat: number; lng: number };
  destination: { lat: number; lng: number };
}

export const api = {
  async requestRide(data: RideRequest) {
    const response = await fetch(`${GATEWAY_URL}/ride/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to request ride');
    return response.json();
  },

  async getRideStatus(rideId: string) {
    const response = await fetch(`${GATEWAY_URL}/ride/status?id=${rideId}`);
    if (!response.ok) throw new Error('Failed to get ride status');
    return response.json();
  },

  // Health check
  async checkGateway() {
    try {
      const response = await fetch(`${GATEWAY_URL}/gateway/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
