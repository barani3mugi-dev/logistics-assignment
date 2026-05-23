import { Logger, InternalServerErrorException } from '@nestjs/common';

export abstract class BaseAuth {
  protected readonly logger = new Logger(this.constructor.name);

  private token: string | null = null;
  private tokenExpiry: number | null = null;

  protected abstract fetchToken(): Promise<string>;

  async getToken(): Promise<string> {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      this.logger.log('Returning cached auth token');
      return this.token;
    }

    return this.refreshToken();
  }

  invalidate(): void {
    this.logger.warn('Invalidating auth token');
    this.token = null;
    this.tokenExpiry = null;
  }

  private async refreshToken(): Promise<string> {
    this.logger.log('Fetching fresh auth token');

    try {
      this.token = await this.fetchToken();
      this.tokenExpiry = Date.now() + 50 * 60 * 1000;
      this.logger.log('Auth token fetched and cached successfully');
      return this.token;
    } catch (error) {
      let errorMessage = '';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
      }
      this.logger.error('Authentication failed', errorMessage);
      throw new InternalServerErrorException(
        'Courier authentication failed. Please try again later.',
      );
    }
  }
}