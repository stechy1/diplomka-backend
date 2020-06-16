import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { Experiment } from '@stechy1/diplomka-share';

import {
  ExperimentsAllQuery,
  ExperimentByIdQuery,
  ExperimentMultimediaQuery,
  ExperimentNameExistsQuery,
} from '../../application/queries';
import {
  ExperimentDeleteCommand,
  ExperimentInsertCommand,
  ExperimentUpdateCommand,
} from '../../application/commands';

@Injectable()
export class ExperimentsFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  public async experimentsAll(): Promise<Experiment[]> {
    return this.queryBus.execute(new ExperimentsAllQuery());
  }

  public async experimentByID(experimentID: number): Promise<Experiment> {
    return this.queryBus.execute(new ExperimentByIdQuery(experimentID));
  }

  public async insert(experiment: Experiment): Promise<number> {
    return this.commandBus.execute(new ExperimentInsertCommand(experiment));
  }

  public async update(experiment: Experiment): Promise<void> {
    return this.commandBus.execute(new ExperimentUpdateCommand(experiment));
  }

  public async delete(experimentID: number): Promise<void> {
    return this.commandBus.execute(new ExperimentDeleteCommand(experimentID));
  }

  public async usedOutputMultimedia(
    experimentID: number
  ): Promise<{ audio: {}; image: {} }> {
    return this.queryBus.execute(new ExperimentMultimediaQuery(experimentID));
  }

  public async nameExists(
    name: string,
    experimentID: number | 'new'
  ): Promise<boolean> {
    return this.queryBus.execute(
      new ExperimentNameExistsQuery(name, experimentID)
    );
  }
}
