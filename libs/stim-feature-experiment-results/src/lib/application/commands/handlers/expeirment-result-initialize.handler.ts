import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { QueryFailedError } from 'typeorm';

import { Experiment, ExperimentResult } from '@stechy1/diplomka-share';

import { StimulatorFacade } from '@diplomka-backend/stim-feature-stimulator';
import { ExperimentsFacade } from '@diplomka-backend/stim-feature-experiments';

import { ExperimentResultsService } from '../../../domain/services/experiment-results.service';
import { QueryError } from '../../../domain/model/query-error';
import { ExperimentResultWasInitializedEvent } from '../../event/impl/experiment-result-was-initialized.event';
import { ExperimentResultWasNotInitializedError } from '../../../domain/exception';
import { ExperimentResultInitializeCommand } from '../impl/experiment-result-initialize.command';

@CommandHandler(ExperimentResultInitializeCommand)
export class ExpeirmentResultInitializeHandler
  implements ICommandHandler<ExperimentResultInitializeCommand, void> {
  constructor(
    private readonly service: ExperimentResultsService,
    private readonly stimulatorFacade: StimulatorFacade,
    private readonly experimentsFacade: ExperimentsFacade,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: ExperimentResultInitializeCommand): Promise<void> {
    // Získám ID aktuálně nahraného experimentu
    const experimentID = await this.stimulatorFacade.getCurrentExperimentID();
    try {
      // Z ID získám úpnou instanci experimentu
      const experiment: Experiment = await this.experimentsFacade.experimentByID(
        experimentID
      );
      // Inicializuji nový výsledek experimentu
      const experimentResult: ExperimentResult = this.service.createEmptyExperimentResult(
        experiment
      );
      // Zvěřejním událost, že byl inicializován výsledek experimentu
      this.eventBus.publish(
        new ExperimentResultWasInitializedEvent(experimentResult)
      );
    } catch (e) {
      if (e instanceof QueryFailedError) {
        throw new ExperimentResultWasNotInitializedError(
          experimentID,
          (e as unknown) as QueryError
        );
      }
      throw new ExperimentResultWasInitializedEvent(experimentID);
    }
  }
}