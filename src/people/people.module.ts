import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';
import { FlightpathIdGenerator } from '../common/utils/flightpath-id.generator';

@Module({
  controllers: [PeopleController],
  providers: [PeopleService, FlightpathIdGenerator],
  exports: [PeopleService, FlightpathIdGenerator],
})
export class PeopleModule {}
