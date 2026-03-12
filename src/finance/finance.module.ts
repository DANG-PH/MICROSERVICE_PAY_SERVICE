import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finance } from './finance.entity';
import { FinanceService } from './finance.service';
import { FinanceController } from './finanace.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Finance])], 
  providers: [FinanceService],                  
  controllers: [FinanceController],            
  exports: [FinanceService],
})
export class FinanceModule {}
