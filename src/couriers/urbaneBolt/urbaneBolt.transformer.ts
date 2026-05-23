import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from 'src/features/orders/dto/create_order.dto';
import {
  NormalizedCancelResponse,
  NormalizedOrderResponse,
  NormalizedTrackResponse,
} from '../types/normalized_response.types';
import { ShipmentStatus } from 'src/common/enums/shipment_status.enum';
import {
  UBCancelResponse,
  UBCreateOrderRequest,
  UBCreateOrderResponse,
  UBTrackResponse,
} from './urbaneBolt.types';
import { ConfigService } from '@nestjs/config';
import { countryMap, payModeMap, stateMap } from 'src/common/constant';

@Injectable()
export class urbaneBoltTransformer {
  constructor(private readonly configService: ConfigService) { }
  toRequest(dto: CreateOrderDto): UBCreateOrderRequest[] {
    const returnAddr = dto.return_address ?? dto.shipper;

    return [
      {
        // order
        customerCode: this.configService.get('URBANEBOLT_CUSTOMER_CODE') || '',
        orderNumber: dto.order_id,
        declaredValue: dto.package.declared_value,
        itemDescription: dto.package.description,
        collectableValue: dto.cod_amount ?? 0,
        height: dto.package.height,
        length: dto.package.length,
        breadth: dto.package.breadth,
        weight: dto.package.weight,
        pieces: dto.package.pieces,
        serviceType: dto.service_type,
        payMode: payModeMap[dto.pay_mode] ?? dto.pay_mode,

        // invoice from courier_meta
        invoiceNumber: dto.courier_meta?.invoice_number,
        invoiceDate: dto.courier_meta?.invoice_date,
        invoiceValue: dto.courier_meta?.invoice_value,
        itemQuantity: dto.package.item_quantity,

        // shipper
        shprName: dto.shipper.name,
        shprMobile: parseInt(dto.shipper.mobile),
        shprEmail: dto.shipper.email,
        shprAddress: dto.shipper.address,
        shprCity: dto.shipper.city,
        shprState: stateMap[dto.shipper.state] ?? dto.shipper.state,
        shprPincode: parseInt(dto.shipper.pincode),
        shprCountry: countryMap[dto.shipper.country] ?? dto.shipper.country,
        shprAddressType: dto.shipper.address_type,

        // consignee
        consName: dto.consignee.name,
        consMobile: parseInt(dto.consignee.mobile),
        consEmail: dto.consignee.email,
        consAddress: dto.consignee.address,
        consCity: dto.consignee.city,
        consState: stateMap[dto.consignee.state] ?? dto.consignee.state,
        consPincode: parseInt(dto.consignee.pincode),
        consCountry: countryMap[dto.consignee.country] ?? dto.consignee.country,
        consAddressType: dto.consignee.address_type,

        // return (fallback to shipper if not provided)
        rtnName: returnAddr.name,
        rtnMobile: parseInt(returnAddr.mobile),
        rtnEmail: returnAddr.email,
        rtnAddress: returnAddr.address,
        rtnCity: returnAddr.city,
        rtnState: stateMap[returnAddr.state] ?? returnAddr.state,
        rtnPincode: parseInt(returnAddr.pincode),
        rtnCountry: countryMap[returnAddr.country] ?? returnAddr.country,
        rtnAddressType: returnAddr.address_type,
      },
    ];
  }


toOrderResponse(
  raw: UBCreateOrderResponse,
  orderId: string,
): NormalizedOrderResponse {
  const data = raw.successResponse?.[0];

  return {
    success:          raw.status === 'Success',
    order_id:         orderId,
    awb_number:       data?.awbNumber?.toString() || '',
    courier_order_id: data?.orderNumber || '',
    status:           ShipmentStatus.CREATED,
    label_url:        data?.shippingLabel || undefined,
    raw_response:     raw,
  };
}
  toTrackResponse(raw: UBTrackResponse): NormalizedTrackResponse {
     if (raw.status === 'Failed') {
    throw new NotFoundException({
      error_code: 'ORDER_NOT_FOUND',
      message: raw.message ?? 'Tracking details not found',
    });
  }
    return {
      awb_number: raw.awbNo,
      current_status: this.mapStatus(raw.currentStatus),
      current_location: raw.location || undefined,
      estimated_delivery: raw.edd || undefined,
      history: (raw.scanDetails ?? []).map((scan) => ({
        status: this.mapStatus(scan.status),
        location: scan.city || undefined,
        timestamp: scan.timestamp,
        description: scan.remarks || undefined,
      })),
      raw_response: raw,
    };
  }

  toCancelResponse(raw: UBCancelResponse): NormalizedCancelResponse {
    return {
      success: raw.status === 'success',
      message: raw.message,
      raw_response: raw,
    };
  }


  private mapStatus(courierStatus: string): ShipmentStatus {
    const map: Record<string, ShipmentStatus> = {
      'MANIFESTED': ShipmentStatus.CREATED,
      'PICKED UP': ShipmentStatus.PICKED_UP,
      'IN TRANSIT': ShipmentStatus.IN_TRANSIT,
      'OUT FOR DELIVERY': ShipmentStatus.OUT_FOR_DELIVERY,
      'DELIVERED': ShipmentStatus.DELIVERED,
      'CANCELLED': ShipmentStatus.CANCELLED,
      'RTO': ShipmentStatus.FAILED,
      'LOST': ShipmentStatus.FAILED,
    };
    return map[courierStatus?.toUpperCase()] ?? ShipmentStatus.FAILED;
  }
}