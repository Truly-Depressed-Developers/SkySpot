export type OrderType = 'STANDARD' | 'FOOD' | 'EMERGENCY_AED' | 'MONITORING' | 'BLOOD';

export type OrderStatus = 'ORDERED' | 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export type OrderDTO = {
  orderId: string;
  type: OrderType;
  weight: number;
  status: OrderStatus;
  destination: CoordsDTO;
  description: string;
};
