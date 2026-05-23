import { CreateOrderDto } from 'src/features/orders/dto/create_order.dto';

export function mapToUrbaneBoltPayload(dto: CreateOrderDto): object {
  return [
    {
      customerCode: process.env.URBANEBOLT_CUSTOMER_CODE,
      orderNumber: dto.order_id,

      // Package
      declaredValue: dto.package.declared_value,
      itemDescription: dto.package.description,
      collectableValue: dto.cod_amount ?? 0,
      height: dto.package.height,
      length: dto.package.length,
      breadth: dto.package.breadth,
      weight: dto.package.weight,
      pieces: dto.package.pieces,
      itemQuantity: dto.package.item_quantity ?? 1,

      // Order
      serviceType: dto.service_type,
      payMode: dto.pay_mode,

      // Invoice
      invoiceNumber: dto.package.invoice_number ?? dto.courier_meta?.invoice_number,
      invoiceDate: dto.package.invoice_date ?? dto.courier_meta?.invoice_date,
      invoiceValue: dto.package.invoice_value ?? dto.courier_meta?.invoice_value,

      // Shipper
      shprName: dto.shipper.name,
      shprMobile: Number(dto.shipper.mobile),
      shprEmail: dto.shipper.email,
      shprAddress: dto.shipper.address,
      shprCity: dto.shipper.city,
      shprState: dto.shipper.state,
      shprPincode: Number(dto.shipper.pincode),
      shprCountry: dto.shipper.country,
      shprAddressType: dto.shipper.address_type,

      // Consignee
      consName: dto.consignee.name,
      consMobile: Number(dto.consignee.mobile),
      consEmail: dto.consignee.email,
      consAddress: dto.consignee.address,
      consCity: dto.consignee.city,
      consState: dto.consignee.state,
      consPincode: Number(dto.consignee.pincode),
      consCountry: dto.consignee.country,
      consAddressType: dto.consignee.address_type,

      // Return address — fallback to shipper if not provided
      rtnName: dto.return_address?.name ?? dto.shipper.name,
      rtnMobile: Number(dto.return_address?.mobile ?? dto.shipper.mobile),
      rtnEmail: dto.return_address?.email ?? dto.shipper.email,
      rtnAddress: dto.return_address?.address ?? dto.shipper.address,
      rtnCity: dto.return_address?.city ?? dto.shipper.city,
      rtnState: dto.return_address?.state ?? dto.shipper.state,
      rtnPincode: Number(dto.return_address?.pincode ?? dto.shipper.pincode),
      rtnCountry: dto.return_address?.country ?? dto.shipper.country,
      rtnAddressType: dto.return_address?.address_type ?? dto.shipper.address_type,
    }
  ];
}