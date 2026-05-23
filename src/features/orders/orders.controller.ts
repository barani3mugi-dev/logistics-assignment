import {
  Controller, Post, Get, Body,
  Param, UsePipes, ValidationPipe, Logger,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create_order.dto';

@Controller('api/v1/orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get(':order_id/track')
  async trackOrder(@Param('order_id') orderId: string) {
    this.logger.log(`GET /api/v1/orders/${orderId}/track`);
    return this.ordersService.trackOrder(orderId);
  }

  @Post(':order_id/cancel')
  async cancelOrder(@Param('order_id') orderId: string) {
    this.logger.log(`POST /api/v1/orders/${orderId}/cancel`);
    return this.ordersService.cancelOrder(orderId);
  }
}