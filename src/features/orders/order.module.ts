import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../orders/entity/order.entity';
import { TrackingHistory } from '../tracking_history/entity/tracking_history.entity';
import { CouriersModule } from '../../couriers/courier.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, TrackingHistory]),
    CouriersModule,              
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],      
})
export class OrdersModule {}