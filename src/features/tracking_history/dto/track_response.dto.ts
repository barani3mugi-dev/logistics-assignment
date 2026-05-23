import { ShipmentStatus } from 'src/common/enums/shipment_status.enum';

export class TrackingEventDto {
  status: ShipmentStatus;
  location?: string;
  timestamp: string;
  description?: string;
}

export class OrderResponseDto {
  success: boolean;
  order_id: string;
  internal_id: string;
  awb_number: string;
  courier_partner: string;
  status: ShipmentStatus;
  label_url?: string;
  created_at: Date;
}

export class TrackResponseDto {
  order_id: string;
  awb_number: string;
  courier_partner: string;
  current_status: ShipmentStatus;
  current_location?: string;
  estimated_delivery?: string;
  history: TrackingEventDto[];
}

export class CancelResponseDto {
  success: boolean;
  order_id: string;
  message: string;
}