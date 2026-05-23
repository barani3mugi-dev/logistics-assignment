import {
    Injectable,
    Logger,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourierFactory } from '../../couriers/factory/courier.factory';
import { Order } from '../orders/entity/order.entity';
import { TrackingHistory } from '../tracking_history/entity/tracking_history.entity';
import { CreateOrderDto } from './dto/create_order.dto';
import {
    OrderResponseDto,
    TrackResponseDto,
    CancelResponseDto,
} from '../tracking_history/dto/track_response.dto';
import { ShipmentStatus } from 'src/common/enums/shipment_status.enum';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        @InjectRepository(TrackingHistory)
        private readonly trackingRepo: Repository<TrackingHistory>,

        private readonly courierFactory: CourierFactory,
    ) { }


    async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
        this.logger.log(`Creating order: ${dto.order_id} via ${dto.courier_partner}`);

        const existing = await this.orderRepo.findOne({
            where: { externalOrderId: dto.order_id },
        });

        if (existing) {
            this.logger.warn(`Duplicate order_id: ${dto.order_id}`);
            throw new ConflictException({
                error_code: 'DUPLICATE_ORDER',
                message: `Order with id '${dto.order_id}' already exists`,
                existing_status: existing.status,
                awb_number: existing.awbNumber,
            });
        }
        const adapter = this.courierFactory.resolve(dto.courier_partner);

        const courierResponse = await adapter.createOrder(dto);
        const order = this.orderRepo.create({
            externalOrderId: dto.order_id,
            courierPartner: dto.courier_partner,
            courierOrderId: courierResponse.courier_order_id,
            awbNumber: courierResponse.awb_number,
            status: courierResponse.success
                ? ShipmentStatus.CREATED
                : ShipmentStatus.FAILED,
            requestPayload: dto as unknown as object,
            responsePayload: courierResponse.raw_response,
            failureReason: courierResponse.success ? undefined : 'Courier rejected the order',
        });

        const saved = await this.orderRepo.save(order);

        await this.saveTrackingEvent(saved, {
            status: saved.status,
            location: undefined,
            description: 'Order created',
            courierTimestamp: new Date().toISOString(),
            rawPayload: courierResponse.raw_response,
        });

        return this.toOrderResponse(saved);
    }


    async trackOrder(orderId: string): Promise<TrackResponseDto> {
        this.logger.log(`Tracking order: ${orderId}`);

        // Step 1 — find order in DB
        const order = await this.findOrderOrFail(orderId);

        if (!order.awbNumber) {
            throw new BadRequestException({
                error_code: 'NO_AWB',
                message: 'Order does not have an AWB number yet',
            });
        }

        const adapter = this.courierFactory.resolve(order.courierPartner);
        const trackResponse = await adapter.trackOrder(order.awbNumber);

        if (trackResponse.current_status !== order.status) {
            await this.orderRepo.update(order.id, {
                status: trackResponse.current_status,
            });

            await this.saveTrackingEvent(order, {
                status: trackResponse.current_status,
                location: trackResponse.current_location,
                description: `Status updated to ${trackResponse.current_status}`,
                courierTimestamp: new Date().toISOString(),
                rawPayload: trackResponse.raw_response,
            });
        }

        return {
            order_id: order.externalOrderId,
            awb_number: order.awbNumber,
            courier_partner: order.courierPartner,
            current_status: trackResponse.current_status,
            current_location: trackResponse.current_location,
            estimated_delivery: trackResponse.estimated_delivery,
            history: trackResponse.history,
        };
    }

    async cancelOrder(orderId: string): Promise<CancelResponseDto> {
        this.logger.log(`Cancelling order: ${orderId}`);

        const order = await this.findOrderOrFail(orderId);

        const nonCancellable = [
            ShipmentStatus.DELIVERED,
            ShipmentStatus.CANCELLED,
            ShipmentStatus.FAILED,
        ];

        if (nonCancellable.includes(order.status)) {
            throw new BadRequestException({
                error_code: 'CANNOT_CANCEL',
                message: `Order in status '${order.status}' cannot be cancelled`,
            });
        }

        const adapter = this.courierFactory.resolve(order.courierPartner);
        const cancelResponse = await adapter.cancelOrder(order.awbNumber);

        if (cancelResponse.success) {
            await this.orderRepo.update(order.id, {
                status: ShipmentStatus.CANCELLED,
            });

            await this.saveTrackingEvent(order, {
                status: ShipmentStatus.CANCELLED,
                location: undefined,
                description: 'Order cancelled',
                courierTimestamp: new Date().toISOString(),
                rawPayload: cancelResponse.raw_response,
            });
        }

        return {
            success: cancelResponse.success,
            order_id: order.externalOrderId,
            message: cancelResponse.message,
        };
    }


    private async findOrderOrFail(orderId: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { externalOrderId: orderId },
        });

        if (!order) {
            throw new NotFoundException({
                error_code: 'ORDER_NOT_FOUND',
                message: `Order '${orderId}' not found`,
            });
        }

        return order;
    }

    private async saveTrackingEvent(
        order: Order,
        event: {
            status: ShipmentStatus;
            location?: string;
            description?: string;
            courierTimestamp?: string;
            rawPayload?: object;
        },
    ): Promise<void> {
        const tracking = this.trackingRepo.create({
            order,
            status: event.status,
            location: event.location,
            description: event.description,
            courierTimestamp: event.courierTimestamp,
            rawPayload: event.rawPayload,
        });

        await this.trackingRepo.save(tracking);
    }

    private toOrderResponse(order: Order): OrderResponseDto {
        return {
            success: order.status !== ShipmentStatus.FAILED,
            order_id: order.externalOrderId,
            internal_id: order.id,
            awb_number: order.awbNumber,
            courier_partner: order.courierPartner,
            status: order.status,
            created_at: order.createdAt,
        };
    }

    async createOrderForBatch(
        dto: CreateOrderDto,
        batchId: string,
    ): Promise<{ order_id: string; success: boolean; data?: any; error?: string }> {
        try {
            const result = await this.createOrder(dto);
            return { order_id: dto.order_id, success: true, data: result };
        } catch (error) {
            let errorMessage = 'Unknown error';
            if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
                errorMessage = (error as any).message;
            }
            return {
                order_id: dto.order_id,
                success: false,
                error: errorMessage,
            };
        }
    }
}