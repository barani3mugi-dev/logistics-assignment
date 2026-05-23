import { Type } from 'class-transformer';
import {
  IsArray, ArrayMaxSize,
  ArrayMinSize, ValidateNested,
} from 'class-validator';
import { CreateOrderDto } from './create_order.dto';

export class BulkOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  orders: CreateOrderDto[];
}

export class BulkOrderResultItem {
  order_id: string;
  success: boolean;
  data?: any;
  error?: string;
}

export class BulkOrderResponseDto {
  total: number;
  succeeded: number;
  failed: number;
  results: BulkOrderResultItem[];
}