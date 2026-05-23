import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ICourierAdapter } from '../interface/courier_adapter.interface';
import { CreateOrderDto } from 'src/features/orders/dto/create_order.dto';
import {
  NormalizedCancelResponse,
  NormalizedOrderResponse,
  NormalizedTrackResponse,
} from '../types/normalized_response.types';
import { urbaneBoltAuth } from './auth';
import { urbaneBoltTransformer } from './urbaneBolt.transformer';   
import { urbaneBoltValidator } from './urbaneBolt.validation';
import { UBCreateOrderResponse } from './urbaneBolt.types';

@Injectable()
export class urbaneBoltAdapter implements ICourierAdapter {
  private readonly logger = new Logger(urbaneBoltAdapter.name);
  private readonly http: AxiosInstance;
  private readonly retryCount: number;

  constructor(
    private readonly auth: urbaneBoltAuth,
    private readonly transformer: urbaneBoltTransformer,
    private readonly validator: urbaneBoltValidator,
    private readonly configService: ConfigService,
  ) {
    this.http = axios.create({
      baseURL: this.configService.get('URBANEBOLT_BASE_URL'),
      timeout: this.configService.get('URBANEBOLT_TIMEOUT_MS') || 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.retryCount = this.configService.get('URBANEBOLT_RETRY_COUNT') || 3;
  }


  async createOrder(dto: CreateOrderDto): Promise<NormalizedOrderResponse> {
    this.logger.log(`Creating order: ${dto.order_id}`);

    this.validator.validate(dto);

    const token = await this.auth.getToken();
    
    const payload = this.transformer.toRequest(dto);

    const raw = await this.callWithRetry<UBCreateOrderResponse>(
      () => this.http.post('/api/v1/services/manifest/', payload, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      dto.order_id,
    );
  if (!raw || raw.status !== 'Success') {
  throw new InternalServerErrorException('Invalid response from courier');
}
    return this.transformer.toOrderResponse(raw, dto.order_id); 
  }

  async trackOrder(awbNumber: string): Promise<NormalizedTrackResponse> {
    this.logger.log(`Tracking order: ${awbNumber}`);

    const token = await this.auth.getToken();

    const raw = await this.callWithRetry(
      () => this.http.get(`/api/v1/services/tracking-pub/?${awbNumber}/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      awbNumber,
    );
      console.log('Track raw response:', JSON.stringify(raw, null, 2));
    return this.transformer.toTrackResponse(raw as any);
  }

  async cancelOrder(awbNumber: string): Promise<NormalizedCancelResponse> {
    this.logger.log(`Cancelling order: ${awbNumber}`);

    const token = await this.auth.getToken();

    const raw = await this.callWithRetry(
      () => this.http.post(
        '/api/v1/services/cancel/',
        { awbNumber },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
      awbNumber,
    );
    return this.transformer.toCancelResponse(raw as any);
  }


  private async callWithRetry<T>(
    fn: () => Promise<any>,
    identifier: string,
    attempt = 1,
  ): Promise<T> {
    try {
      const response = await fn();
      return response.data;
    } catch (error) {
      const status = (error && typeof error === 'object' && 'response' in error && (error as any).response)
        ? (error as any).response.status
        : undefined;

      if (status === 401 && attempt === 1) {
        this.logger.warn(`Token expired for ${identifier}, re-authenticating`);
        this.auth.invalidate();
        await this.auth.getToken();
        return this.callWithRetry<T>(fn, identifier, attempt + 1);
      }

      if (status >= 400 && status < 500) {
        const errorData = (error && typeof error === 'object' && 'response' in error && (error as any).response)
          ? (error as any).response.data
          : undefined;
        this.logger.error(`Courier 4xx for ${identifier}: ${JSON.stringify(errorData)}`);
        throw new BadRequestException({
          error_code: 'COURIER_REJECTED',
          message: errorData?.message ?? 'Courier rejected the request',
        });
      }

      if (attempt <= this.retryCount) {
        const delay = attempt * 1000;
        this.logger.warn(`Retrying ${identifier} attempt ${attempt}/${this.retryCount} in ${delay}ms`);
        await this.sleep(delay);
        return this.callWithRetry<T>(fn, identifier, attempt + 1);
      }

      this.logger.error(`All retries exhausted for ${identifier}`);
      throw new InternalServerErrorException(
        'Courier service unavailable. Please try again later.',
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}