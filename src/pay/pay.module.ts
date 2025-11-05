import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pay } from './pay.entity';
import { PayService } from './pay.service';
import { PayController } from './pay.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pay])], 
  providers: [PayService],
  controllers: [PayController],
  exports: [PayService], // nếu muốn dùng ở module khác
})
export class PayModule {}