import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PayService } from './pay.service';
import type {
  GetPayByUserIdRequest,
  PayResponse,
  UpdateMoneyRequest,
  UpdateStatusRequest,
  CreatePayRequest,
  QrResponse,
  CreatePayOrderRequest
} from 'proto/pay.pb';
import { PAY_SERVICE_NAME } from 'proto/pay.pb';

@Controller()
export class PayController {
  constructor(private readonly payService: PayService) {}

  // Lấy ví theo userId
  @GrpcMethod(PAY_SERVICE_NAME, 'GetPayByUserId')
  async getPayByUserId(data: GetPayByUserIdRequest): Promise<PayResponse> {
    return this.payService.getPayByUserId(data);
  }

  // Cộng / trừ tiền
  @GrpcMethod(PAY_SERVICE_NAME, 'UpdateMoney')
  async updateMoney(data: UpdateMoneyRequest): Promise<PayResponse> {
    return this.payService.updateMoney(data);
  }

  // Khóa / mở khóa ví
  @GrpcMethod(PAY_SERVICE_NAME, 'UpdateStatus')
  async updateStatus(data: UpdateStatusRequest): Promise<PayResponse> {
    return this.payService.updateStatus(data);
  }

  // Tạo ví mới
  @GrpcMethod(PAY_SERVICE_NAME, 'CreatePay')
  async createPay(data: CreatePayRequest): Promise<PayResponse> {
    return this.payService.createPay(data);
  }

  // Tạo đơn thanh toán (ví dụ sinh QR)
  @GrpcMethod(PAY_SERVICE_NAME, 'CreatePayOrder')
  async createPayOrder(data: CreatePayOrderRequest): Promise<QrResponse> {
    return this.payService.createPayOrder(data);
  }
}
