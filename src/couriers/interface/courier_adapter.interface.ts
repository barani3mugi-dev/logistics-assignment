import { CreateOrderDto } from 'src/features/orders/dto/create_order.dto';
import {
  NormalizedCancelResponse,
  NormalizedOrderResponse,
  NormalizedTrackResponse,
} from '../types/normalized_response.types';

export interface ICourierAdapter {
  createOrder(dto: CreateOrderDto): Promise<NormalizedOrderResponse>;
  trackOrder(awbNumber: string): Promise<NormalizedTrackResponse>;
  cancelOrder(awbNumber: string): Promise<NormalizedCancelResponse>;
}