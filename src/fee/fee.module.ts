import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeService } from './fee.service';
import { FeeBalanceUssdView } from './entities/fee-balance-ussd.view';
import { FeeStructureUssdView } from './entities/fee-structure-ussd.view';
import { PaymentInstructionsUssdView } from './entities/payment-instructions-ussd.view';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeeBalanceUssdView,
      FeeStructureUssdView,
      PaymentInstructionsUssdView,
    ]),
  ],
  providers: [FeeService],
  exports: [FeeService],
})
export class FeeModule {}
