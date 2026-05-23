import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { BaseAuth } from '../shared/auth.base';
import { UBAuthResponse } from './urbaneBolt.types';

@Injectable()
export class urbaneBoltAuth extends BaseAuth {
    private readonly http: AxiosInstance;

    constructor(private readonly configService: ConfigService) {
        super();

        this.http = axios.create({
            baseURL: this.configService.get('URBANEBOLT_BASE_URL'),
            timeout: this.configService.get('URBANEBOLT_TIMEOUT_MS') || 10000,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    protected async fetchToken(): Promise<string> {
        const response = await this.http.post<UBAuthResponse>(
            '/api/v1/auth/getToken/',
            {
                username: this.configService.get('URBANEBOLT_USERNAME'),
                password: this.configService.get('URBANEBOLT_PASSWORD'),
            },
        );
 console.log('Full response:', JSON.stringify(response.data, null, 2));
        return response.data.access_token;
    }
}