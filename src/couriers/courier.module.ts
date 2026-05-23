import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CourierFactory } from './factory/courier.factory';
import { urbaneBoltAdapter } from './urbaneBolt/urbaneBolt.adaptor';
import { urbaneBoltAuth } from './urbaneBolt/auth';
import { urbaneBoltTransformer } from './urbaneBolt/urbaneBolt.transformer';
import { urbaneBoltValidator } from './urbaneBolt/urbaneBolt.validation';
import { MockAdapter } from './mock/mock.adaptor';

@Module({
  imports: [ConfigModule],
  providers: [
    CourierFactory,

    urbaneBoltAdapter,
    urbaneBoltAuth,
    urbaneBoltTransformer,
    urbaneBoltValidator,
    MockAdapter,
  ],
  exports: [CourierFactory],
})
export class CouriersModule {}