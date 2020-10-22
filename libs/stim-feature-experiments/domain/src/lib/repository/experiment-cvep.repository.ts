import { Injectable, Logger } from '@nestjs/common';

import { DeleteResult, EntityManager, InsertResult, Repository } from 'typeorm';

import { Experiment, ExperimentAssets, ExperimentCVEP, Output } from '@stechy1/diplomka-share';

import { ExperimentCvepEntity } from '../model/entity/experiment-cvep.entity';
import { ExperimentCvepOutputEntity } from '../model/entity/experiment-cvep-output.entity';
import { CustomExperimentRepository } from './custom-experiment-repository';
import { entityToExperimentCvep, experimentCvepOutputToEntity, experimentCvepToEntity } from './experiments.mapping';

@Injectable()
export class ExperimentCvepRepository implements CustomExperimentRepository<Experiment<Output>, ExperimentCVEP> {
  private readonly logger: Logger = new Logger(ExperimentCvepRepository.name);

  private readonly _cvepRepository: Repository<ExperimentCvepEntity>;
  private readonly _cvepOutputRepository: Repository<ExperimentCvepOutputEntity>;

  constructor(private readonly _manager: EntityManager) {
    this._cvepRepository = _manager.getRepository(ExperimentCvepEntity);
    this._cvepOutputRepository = _manager.getRepository(ExperimentCvepOutputEntity);
  }

  async one(experiment: Experiment<Output>): Promise<ExperimentCVEP> {
    const experimentCVEP = await this._cvepRepository.findOne(experiment.id);
    if (experimentCVEP === undefined) {
      this.logger.warn(`Experiment CVEP s id: ${experiment.id} nebyl nalezen!`);
      return undefined;
    }

    const outputs = await this._cvepOutputRepository.find({
      where: { experimentId: experiment.id },
    });

    return entityToExperimentCvep(experiment, experimentCVEP, outputs);
  }

  async insert(experiment: ExperimentCVEP): Promise<InsertResult> {
    return this._cvepRepository.insert(experimentCvepToEntity(experiment));
  }

  async update(experiment: ExperimentCVEP): Promise<void> {
    await this._manager.transaction(async (transactionManager: EntityManager) => {
      const tvepRepository = transactionManager.getRepository(ExperimentCvepEntity);
      const tvepOutputRepository = transactionManager.getRepository(ExperimentCvepOutputEntity);
      this.logger.verbose('Aktualizuji výstupy experimentu...');
      for (const output of experiment.outputs) {
        this.logger.verbose('Aktualizuji výstup experimentu: ');
        this.logger.verbose(experimentCvepOutputToEntity(output));
        await tvepOutputRepository.update({ id: output.id }, experimentCvepOutputToEntity(output));
      }
      this.logger.verbose('Aktualizuji TVEP experiment: ');
      this.logger.verbose(experimentCvepToEntity(experiment));
      await tvepRepository.update({ id: experiment.id }, experimentCvepToEntity(experiment));
    });
  }

  async delete(id: number): Promise<DeleteResult> {
    return this._cvepRepository.delete({ id });
  }

  outputMultimedia(experiment: ExperimentCVEP): ExperimentAssets {
    const multimedia: ExperimentAssets = {
      audio: {},
      image: {},
    };
    for (let i = 0; i < experiment.outputCount; i++) {
      const output = experiment.outputs[i];
      if (output.outputType.audio) {
        multimedia.audio[i] = output.outputType.audioFile;
      }
      if (output.outputType.image) {
        multimedia.image[i] = output.outputType.imageFile;
      }
    }

    return multimedia;
  }
}
