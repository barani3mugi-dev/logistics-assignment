import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error_code = 'INTERNAL_SERVER_ERROR';
    let message = 'Something went wrong. Please try again later.';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;

        if (Array.isArray(res.message)) {
          error_code = 'VALIDATION_ERROR';
          message = 'Validation failed';
          details = res.message;
        } else {
          error_code = res.error_code ?? this.statusToCode(status);
          message = res.message ?? message;
          details = res.missing_fields
            ?? res.supported_couriers
            ?? res.existing_status
            ?? null;
        }
      }
    }

    this.logger.error(
      JSON.stringify({
        requestId,
        method: request.method,
        url: request.url,
        status,
        error_code,
        message,
        stack: exception instanceof Error ? exception.stack : null,
      }),
    );

    response.status(status).json({
      success: false,
      error_code,
      message,
      details,        
      request_id: requestId,
      timestamp,
      path: request.url,
    });
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };
    return map[status] ?? 'UNKNOWN_ERROR';
  }
}