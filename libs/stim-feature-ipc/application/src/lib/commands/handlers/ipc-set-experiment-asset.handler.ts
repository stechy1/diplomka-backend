import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus } from '@nestjs/cqrs';

import { CommandIdService } from '@diplomka-backend/stim-lib-common';
import { SettingsFacade } from '@diplomka-backend/stim-feature-settings';
import { ExperientAssetsMessage } from '@diplomka-backend/stim-feature-ipc/domain';

import { IpcService } from '../../services/ipc.service';
import { IpcEvent } from '../../event/impl/ipc.event';
import { IpcSetExperimentAssetCommand } from '../impl/ipc-set-experiment-asset.command';
import { BaseIpcBlockingHandler } from './base/base-ipc-blocking.handler';

@CommandHandler(IpcSetExperimentAssetCommand)
export class IpcSetExperimentAssetHandler extends BaseIpcBlockingHandler<IpcSetExperimentAssetCommand, void> {
  constructor(private readonly service: IpcService, settings: SettingsFacade, commandIdService: CommandIdService, eventBus: EventBus) {
    super(settings, commandIdService, eventBus, new Logger(IpcSetExperimentAssetHandler.name));
  }

  protected async callServiceMethod(command: IpcSetExperimentAssetCommand, commandID: number): Promise<void> {
    this.service.send(new ExperientAssetsMessage(command.data, commandID));
  }

  protected done(event: IpcEvent<void>, command: IpcSetExperimentAssetCommand | undefined): void {
    this.logger.debug('Informace o assetech byla úspěšně odeslána.');
    // this.logger.debug('IPC socket byl úspěšně uzavřen.');
    // this.eventBus.publish(new IpcClosedEvent());
  }

  protected init(): Promise<void> {
    this.logger.debug('Budu odesílat informaci o assetech aktuálního experimentu do přehrávače multimédií.');
    return super.init();
  }

  protected isValid(event: IpcEvent<void>): boolean {
    return false;
  }
}