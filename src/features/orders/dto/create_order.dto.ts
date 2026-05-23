import { Type } from 'class-transformer';
import {
  IsEnum, IsNotEmpty, IsNumber,
  IsObject, IsOptional, IsString,
  ValidateNested,
} from 'class-validator';
import { CourierPartner } from 'src/common/enums/courier_partner.enum';

export class PackageDto {
  @IsNumber()
  weight: number;

  @IsNumber()
  length: number;

  @IsNumber()
  breadth: number;

  @IsNumber()
  height: number;

  @IsNumber()
  pieces: number;

  @IsString()
  description: string;

  @IsNumber()
  declared_value: number;

  @IsOptional()
  @IsString()
  invoice_number?: string;

  @IsOptional()
  @IsString()
  invoice_date?: string;

  @IsOptional()
  @IsNumber()
  invoice_value?: number;

  @IsOptional()
  @IsNumber()
  item_quantity?: number;
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  pincode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsString()
  address_type?: string;       // "Home" | "Seller" | "Office"
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;            // YOUR internal order ID (idempotency key)

  @IsEnum(CourierPartner)
  courier_partner: CourierPartner;

  @IsString()
  service_type: string;        // "SDD" | "NDD" | "EXPRESS"

  @IsString()
  pay_mode: string;            // "COD" | "PREPAID"

  @IsOptional()
  @IsNumber()
  cod_amount?: number;         // only required if pay_mode is COD

  @ValidateNested()
  @Type(() => PackageDto)
  package: PackageDto;

  @ValidateNested()
  @Type(() => AddressDto)
  shipper: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  consignee: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  return_address?: AddressDto; // if not provided, shipper address is used

  @IsOptional()
  @IsObject()
  courier_meta?: Record<string, any>; // courier-specific extra fields
}