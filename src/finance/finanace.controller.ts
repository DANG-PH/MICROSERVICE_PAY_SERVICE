import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FinanceService } from 'src/finance/finance.service';
import type {
  CreateFinanceRequest,
  GetFinanceByUserRequest,
  FinanceResponse,
  ListFinanceResponse,
  FinanceSummaryResponse,
} from '../../proto/pay.pb';
import { FINANCE_SERVICE_NAME } from '../../proto/pay.pb';

@Controller()
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
  ) {}

  // ===== Finance RPC =====
  @GrpcMethod(FINANCE_SERVICE_NAME, 'CreateFinanceRecord')
  async createFinanceRecord(payload: CreateFinanceRequest): Promise<FinanceResponse> {
    return this.financeService.createFinanceRecord(payload);
  }

  @GrpcMethod(FINANCE_SERVICE_NAME, 'GetFinanceByUser')
  async getFinanceByUser(payload: GetFinanceByUserRequest): Promise<ListFinanceResponse> {
    return this.financeService.getFinanceByUser(payload);
  }

  @GrpcMethod(FINANCE_SERVICE_NAME, 'GetAllFinance')
  async getAllFinance(): Promise<ListFinanceResponse> {
    return this.financeService.getAllFinance();
  }

  @GrpcMethod(FINANCE_SERVICE_NAME, 'GetFinanceSummary')
  async getFinanceSummary(): Promise<FinanceSummaryResponse> {
    return this.financeService.getFinanceSummary();
  }
}