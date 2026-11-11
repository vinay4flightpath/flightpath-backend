import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { FlightpathIdGenerator } from '../common/utils/flightpath-id.generator';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, FlightpathIdGenerator],
  exports: [TenantsService],
})
export class TenantsModule {}
