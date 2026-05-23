import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from 'src/features/orders/dto/create_order.dto';

@Injectable()
export class urbaneBoltValidator {
  validate(dto: CreateOrderDto): void {
    const missing: string[] = [];

    if (dto.pay_mode === 'COD' && !dto.cod_amount) {
      missing.push('cod_amount (required when pay_mode is COD)');
    }

    if (!dto.consignee.pincode) missing.push('consignee.pincode');
    if (!dto.shipper.pincode)   missing.push('shipper.pincode');

    if (dto.package.weight <= 0) missing.push('package.weight must be greater than 0');

    if (missing.length > 0) {
      throw new BadRequestException({
        error_code: 'VALIDATION_ERROR',
        message: 'Missing or invalid required fields for urbaneeBolt',
        missing_fields: missing,
      });
    }
  }
}