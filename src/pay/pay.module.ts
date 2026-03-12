import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pay } from './pay.entity';
import { PayService } from './pay.service';
import { PayController } from './pay.controller';
import { PayRestController } from './payrest.controller';
import { FinanceModule } from 'src/finance/finance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pay]),FinanceModule], 
  providers: [PayService],
  controllers: [PayController, PayRestController],
  exports: [PayService], // nếu muốn dùng ở module khác
})
export class PayModule {}