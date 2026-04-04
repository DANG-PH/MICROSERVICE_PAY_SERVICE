import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pay } from './pay.entity';
import {
  GetPayByUserIdRequest,
  PayResponse,
  UpdateMoneyRequest,
  UpdateStatusRequest,
  CreatePayRequest,
  CreatePayOrderRequest,
  QrResponse,
} from 'proto/pay.pb';
import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { winstonLogger } from 'src/logger/logger.config';
import { FinanceService } from 'src/finance/finance.service';

@Injectable()
export class PayService {
  constructor(
    @InjectRepository(Pay)
    private readonly payRepository: Repository<Pay>,

    private readonly financeService: FinanceService,
  ) {}

  async getPayByUserId(data: GetPayByUserIdRequest): Promise<PayResponse> {
    const pay = await this.payRepository.findOne({ where: { userId: data.userId } });
    if (!pay) throw new RpcException({code: status.NOT_FOUND ,message: 'Không tìm thấy ví của user'});
    return {
        pay: {
            ...pay,
            updatedAt: pay.updatedAt.toISOString(), 
        },
        message: 'Lấy ví thành công',
    };
  }

  async updateMoney(data: UpdateMoneyRequest): Promise<PayResponse> {
    const pay = await this.payRepository.findOne({ where: { userId: data.userId } });
    if (!pay) throw new RpcException({code: status.NOT_FOUND ,message: 'Không tìm thấy ví của user'});
    if (pay.status === 'locked') throw new RpcException({code: status.PERMISSION_DENIED ,message: 'ví của bạn đã bị khóa'});

    const currentMoney = parseInt(pay.tien);
    const newMoney = currentMoney + Number(data.amount);
    if (newMoney < 0) throw new RpcException({code: status.INVALID_ARGUMENT ,message: 'Số tiền không hợp lệ'});

    pay.tien = newMoney.toString();
    pay.updatedAt = new Date();
    await this.payRepository.save(pay);

    return { 
        pay: {
            ...pay,
            updatedAt: pay.updatedAt.toISOString(), 
        },
        message: 'Cập nhật số dư thành công'
    };
  }

  async updateStatus(data: UpdateStatusRequest): Promise<PayResponse> {
    const pay = await this.payRepository.findOne({ where: { userId: data.userId } });
    if (!pay) throw new RpcException({code: status.NOT_FOUND ,message: 'Không tìm thấy ví của user'});

    pay.status = data.status;
    pay.updatedAt = new Date();
    await this.payRepository.save(pay);

    return { 
        pay: {
            ...pay,
            updatedAt: pay.updatedAt.toISOString(), 
        },
        message: `Đã ${data.status === 'locked' ? 'khóa' : 'mở khóa'} ví` 
    };
  }

  async createPay(data: CreatePayRequest): Promise<PayResponse> {
    const existed = await this.payRepository.findOne({ where: { userId: data.userId } });
    if (existed) throw new RpcException({code: status.ALREADY_EXISTS ,message: 'Ví đã tồn tại'});

    const newPay = this.payRepository.create({
      userId: data.userId,
      tien: '0',
      status: 'open',
      updatedAt: new Date(),
    });

    const saved = await this.payRepository.save(newPay);
    return { 
        pay: {
            ...saved,
            updatedAt: saved.updatedAt.toISOString(), 
        },
        message: 'Tạo ví thành công' 
    };
  }

  async createPayOrder(data: CreatePayOrderRequest): Promise<QrResponse> {
    const pay = await this.payRepository.findOne({ where: { userId: data.userId } });
    if (!pay) throw new RpcException({code: status.NOT_FOUND ,message: 'Không tìm thấy ví của user'});
    if (data.amount < 0) throw new RpcException({code: status.INVALID_ARGUMENT ,message: 'Số tiền không hợp lệ'});
    const templates = ['UMdcQhV', 'Jot2fKT', '0yWfPjD', 'TmyuxXw'];
    const selected = templates[Math.floor(Math.random() * templates.length)];
    const addInfo = encodeURIComponent(`HDG STUDIO ${data.userId} ${data.username} ${data.amount}`);
    const qr = `https://img.vietqr.io/image/ocb-CASS99999-${selected}.jpg?amount=${data.amount}&addInfo=${addInfo}&accountName=Pham+Hai+Dang`;
    return { qr: qr, username: data.username };
  }

  async handleCassoTransaction(body: any): Promise<void> {
    try {
      const data = body?.data;
      if (!data || typeof data !== 'object') {
        console.log('Webhook không có dữ liệu giao dịch hoặc sai cấu trúc.');
        return;
      }

      const { description, id: tid, amount, reference, transactionDateTime } = data;
      console.log(`Nhận giao dịch ${tid}: ND: ${description}`);

      if (!description) {
        console.log('⚠️ Thiếu nội dung giao dịch.');
        return;
      }

      // Chuẩn hóa ND
      const normalized = description.replace(/%/g, ' ').trim();
      const parts = normalized.split(/\s+/);
      const studioIndex = parts.findIndex(p => p.toUpperCase() === 'STUDIO');

      // Format phải có ít nhất 5 phần tử: ["HDG", "STUDIO", "1", "dang123", "50000"]
      if (studioIndex === -1 || parts.length < studioIndex + 4) {
        console.log(`⚠️ ND thiếu dữ liệu hợp lệ sau 'STUDIO': ${description}`);
        return;
      }

      // Lấy 3 phần tử sau cùng
      const userId = parseInt(parts[studioIndex + 1]);
      const username = parts[studioIndex + 2];
      // const inputAmount = parseInt(parts[studioIndex + 3]);
      const inputAmount = amount;

      if (isNaN(userId) || isNaN(inputAmount)) {
        console.log(`⚠️ Dữ liệu không hợp lệ (ID hoặc số tiền): ${description}`);
        return;
      }

      // Gọi updateMoney
      const request: UpdateMoneyRequest = {
        userId,
        amount: inputAmount,
      };

      await this.updateMoney(request);
      await this.financeService.createFinanceRecord({
        user_id: userId,
        type: "NAP",
        amount: inputAmount
      }) 

      winstonLogger.log({ nhiemVu: 'thongBaoNapTien', username: username, amount: inputAmount })

      console.log(`Đã cộng ${inputAmount}đ cho userId ${userId} (username: ${username})`);
    } catch (error) {
      console.log('Lỗi khi xử lý webhook Casso:', error);
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Lỗi xử lý webhook',
      });
    }
  }
}