import { ShipmentStatus } from 'src/common/enums/shipment_status.enum';

export interface NormalizedOrderResponse {
  success: boolean;
  order_id: string;
  awb_number: string;
  courier_order_id: string;
  status: ShipmentStatus;
  label_url?: string | null;
  estimated_delivery?: string;
  raw_response: object;        // full courier response — saved to DB only
}

export interface NormalizedTrackResponse {
  awb_number: string;
  current_status: ShipmentStatus;
  current_location?: string;
  estimated_delivery?: string;
  history: NormalizedTrackingEvent[];
  raw_response: object;
}

export interface NormalizedTrackingEvent {
  status: ShipmentStatus;
  location?: string;
  timestamp: string;
  description?: string;
}

export interface NormalizedCancelResponse {
  success: boolean;
  message: string;
  raw_response: object;
}