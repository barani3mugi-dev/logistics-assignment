import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ICourierAdapter } from '../interface/courier_adapter.interface';
import { urbaneBoltAdapter } from '../urbaneBolt/urbaneBolt.adaptor';
import { MockAdapter } from '../mock/mock.adaptor';
import { CourierPartner } from 'src/common/enums/courier_partner.enum';

@Injectable()
export class CourierFactory {
  private readonly logger = new Logger(CourierFactory.name);
  private readonly adapters: Map<string, ICourierAdapter>;

  constructor(
    private readonly urbaneBoltAdapter: urbaneBoltAdapter,
    private readonly mockAdapter: MockAdapter,
  ) {
    this.adapters = new Map<string, ICourierAdapter>([
      [CourierPartner.urbane_BOLT, this.urbaneBoltAdapter],
      [CourierPartner.MOCK, this.mockAdapter],
    ]);
  }

  resolve(courierPartner: string): ICourierAdapter {
    this.logger.log(`Resolving adapter for courier: ${courierPartner}`);

    const adapter = this.adapters.get(courierPartner);

    if (!adapter) {
      const supported = [...this.adapters.keys()];
      this.logger.error(`Unknown courier partner: ${courierPartner}`);

      throw new BadRequestException({
        error_code: 'UNSUPPORTED_COURIER',
        message: `Courier partner '${courierPartner}' is not supported`,
        supported_couriers: supported,
      });
    }

    return adapter;
  }

  getSupportedCouriers(): string[] {
    return [...this.adapters.keys()];
  }
}