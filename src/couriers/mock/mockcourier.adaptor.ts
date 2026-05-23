import { Injectable, Logger } from '@nestjs/common';
import { ICourierAdapter } from '../interface/courier_adapter.interface';
import { CreateOrderDto } from 'src/features/orders/dto/create_order.dto';
import {
  NormalizedCancelResponse,
  NormalizedOrderResponse,
  NormalizedTrackResponse,
} from '../types/normalized_response.types';
import { ShipmentStatus } from 'src/common/enums/shipment_status.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockCourierAdapter implements ICourierAdapter {
  private readonly logger = new Logger(MockCourierAdapter.name);

  async createOrder(dto: CreateOrderDto): Promise<NormalizedOrderResponse> {
    this.logger.log(`[MOCK-COURIER] Creating order: ${dto.order_id}`);
    await this.sleep(150);
    const awb = `MOCKCOURIER-AWB-${uuidv4().slice(0, 8).toUpperCase()}`;
    const raw = {
      status: 'success',
      awbNumber: awb,
      shipmentId: `MOCKCOURIER-SHIP-${uuidv4().slice(0, 6)}`,
      message: 'MockCourier order created successfully',
    };
    return {
      success: true,
      order_id: dto.order_id,
      awb_number: awb,
      courier_order_id: raw.shipmentId,
      status: ShipmentStatus.CREATED,
      label_url: null,
      raw_response: raw,
    };
  }

  async trackOrder(awbNumber: string): Promise<NormalizedTrackResponse> {
    this.logger.log(`[MOCK-COURIER] Tracking order: ${awbNumber}`);
    await this.sleep(80);
    const raw = {
      awbNo: awbNumber,
      currentStatus: 'DELIVERED',
      location: 'MockCourier Hub, Bangalore',
      edd: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      scanDetails: [
        {
          status: 'MANIFESTED',
          city: 'Chennai',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          remarks: 'Order manifested',
        },
        {
          status: 'DELIVERED',
          city: 'Bangalore',
          timestamp: new Date().toISOString(),
          remarks: 'Order delivered',
        },
      ],
    };
    return {
      awb_number: awbNumber,
      current_status: ShipmentStatus.DELIVERED,
      current_location: raw.location,
      estimated_delivery: raw.edd,
      history: raw.scanDetails.map((scan) => ({
        status:
          scan.status === 'MANIFESTED'
            ? ShipmentStatus.CREATED
            : ShipmentStatus.DELIVERED,
        location: scan.city,
        timestamp: scan.timestamp,
        description: scan.remarks,
      })),
      raw_response: raw,
    };
  }

  async cancelOrder(awbNumber: string): Promise<NormalizedCancelResponse> {
    this.logger.log(`[MOCK-COURIER] Cancelling order: ${awbNumber}`);
    await this.sleep(80);
    const raw = {
      status: 'success',
      message: `MockCourier order ${awbNumber} cancelled successfully`,
    };
    return {
      success: true,
      message: raw.message,
      raw_response: raw,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
