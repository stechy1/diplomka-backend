import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { Settings } from '@stechy1/diplomka-share';

import { SettingsFacade } from '@diplomka-backend/stim-feature-settings';

import { SerialService } from '../../service/serial.service';
import { OpenCommand } from '../impl/open.command';

@CommandHandler(OpenCommand)
export class OpenHandler implements ICommandHandler<OpenCommand> {
  private readonly logger: Logger = new Logger(OpenHandler.name);

  constructor(private readonly service: SerialService, private readonly facade: SettingsFacade) {}

  async execute(command: OpenCommand): Promise<void> {
    this.logger.debug(`Budu otevírat sériovou linku na adrese: '${command.path}'.`);
    this.logger.debug('1. Získám aktuální nastavení.');
    const settings: Settings = await this.facade.getSettings();
    this.logger.debug('Nastavení bylo úspěšně získáno');
    this.logger.debug('2. Z nastavení si přečtu potřebnou proměnnou.');
    const serialConfig: Record<string, unknown> = settings.serial;
    this.logger.debug(`{serial=${JSON.stringify(serialConfig)}}`);
    this.logger.debug('3. Otevřu port s konfigurací z nastavení');
    await this.service.open(command.path, serialConfig);
  }
}
