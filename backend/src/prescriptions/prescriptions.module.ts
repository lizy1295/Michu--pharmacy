import { Module } from '@nestjs/common';
import { PrescriptionsController } from './prescription.controller';

@Module({
  controllers: [PrescriptionsController],
})
export class PrescriptionsModule {}
