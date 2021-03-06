import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

import { BaseSeederService } from '@diplomka-backend/stim-feature-seed/application';
import { Seeder } from '@diplomka-backend/stim-feature-seed/domain';

import { ExperimentErpOutputDependencyEntity } from '../model/entity/experiment-erp-output-dependency.entity';

@Injectable()
@Seeder(ExperimentErpOutputDependencyEntity)
export class ExperimentErpOutputDependencySeeder extends BaseSeederService<ExperimentErpOutputDependencyEntity> {
  protected convertEntities(data: ExperimentErpOutputDependencyEntity[]): ExperimentErpOutputDependencyEntity[] {
    return plainToClass(ExperimentErpOutputDependencyEntity, data);
  }
}
