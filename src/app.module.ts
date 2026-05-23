import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './features/orders/order.module';
import { CouriersModule } from './couriers/courier.module';
import { Order } from './features/orders/entity/order.entity';
import { TrackingHistory } from './features/tracking_history/entity/tracking_history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres' as const,
    url: config.get('DATABASE_URL'),
    ssl: { rejectUnauthorized: false },  // required for Supabase
    entities: [Order, TrackingHistory],
    synchronize: config.get('NODE_ENV') !== 'production',
    logging: config.get('NODE_ENV') === 'development',
  }),
}),

    CouriersModule,
    OrdersModule,
  ],
})
export class AppModule {}