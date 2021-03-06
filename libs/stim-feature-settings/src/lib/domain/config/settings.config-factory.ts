import { ConfigService } from '@nestjs/config';

import { AbstractModuleOptionsFactory, BaseModuleOptionsFactory } from '@diplomka-backend/stim-lib-config';

import { SettingsModuleConfig } from './settings.config-descriptor';
import { KEY__FILE_NAME, SETTINGS_CONFIG_PREFIX } from './settings.config-constants';

export interface SettingsConfigFactory extends BaseModuleOptionsFactory<SettingsModuleConfig> {}

export class SettingsModuleConfigFactoryImpl extends AbstractModuleOptionsFactory<SettingsModuleConfig> implements SettingsConfigFactory {

  constructor(config: ConfigService) {
    super(config, SETTINGS_CONFIG_PREFIX);
  }

  createOptions(): Promise<SettingsModuleConfig> | SettingsModuleConfig {
    return {
        fileName: this.readConfig(KEY__FILE_NAME)
      };
  }

}
