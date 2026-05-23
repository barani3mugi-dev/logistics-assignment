// Their create order request (array of orders)
export interface UBCreateOrderRequest {
  customerCode: string;
  orderNumber: string;
  declaredValue: number;
  itemDescription: string;
  collectableValue: number;
  height: number;
  length: number;
  breadth: number;
  pieces: number;
  weight: number;
  serviceType: string;
  payMode: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceValue?: number;
  itemQuantity?: number;

  // shipper
  shprName: string;
  shprMobile: number;
  shprEmail?: string;
  shprAddress: string;
  shprCity: string;
  shprState: string;
  shprPincode: number;
  shprCountry: string;
  shprAddressType?: string;

  // consignee
  consName: string;
  consMobile: number;
  consEmail?: string;
  consAddress: string;
  consCity: string;
  consState: string;
  consPincode: number;
  consCountry: string;
  consAddressType?: string;

  // return
  rtnName: string;
  rtnMobile: number;
  rtnEmail?: string;
  rtnAddress: string;
  rtnCity: string;
  rtnState: string;
  rtnPincode: number;
  rtnCountry: string;
  rtnAddressType?: string;
}

// Their auth response
export interface UBAuthResponse {
  access_token: string;
  expiresIn?: number;
}

// Their create order response
export interface UBCreateOrderResponse {
  status: string;
  successResponse: Array<{
    awbNumber: number;
    orderNumber: string;
    shippingLabel: string;
    routeCode?: string;
    customerCode?: string;
  }>;
  errorResponse: Array<any>;
}

// Their track response
export interface UBTrackResponse {
  status?: string;
  message: string;
  awbNo: string;
  currentStatus: string;
  location?: string;
  edd?: string;
  scanDetails?: UBScanDetail[];
}

export interface UBScanDetail {
  status: string;
  city?: string;
  timestamp: string;
  remarks?: string;
}

// Their cancel response
export interface UBCancelResponse {
  status: string;
  message: string;
}