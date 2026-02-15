import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateFeeBalanceDto {
  @IsNotEmpty()
  @IsNumber()
  feeBalance: number;
}
