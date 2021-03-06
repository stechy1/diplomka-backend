import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SequenceEntity } from './model/entity/sequence.entity';
import { REPOSITORIES } from './repository';
import { SEEDERS } from './seeder';
import { SequenceGeneratorFactory } from './generator/sequence-generator.factory';

@Module({
  imports: [TypeOrmModule.forFeature([SequenceEntity])],
  providers: [...REPOSITORIES, ...SEEDERS, SequenceGeneratorFactory],
  exports: [...REPOSITORIES, SequenceGeneratorFactory],
})
export class StimFeatureSequencesDomainModule {}
