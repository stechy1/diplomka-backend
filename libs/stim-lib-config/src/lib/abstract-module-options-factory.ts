import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isBooleanString, isNumberString } from 'class-validator';

import { BaseModuleOptions, BaseModuleOptionsFactory } from './interfaces';
import { ConfigKey, PrimitiveType } from './config-key';

export abstract class AbstractModuleOptionsFactory<O extends BaseModuleOptions> implements BaseModuleOptionsFactory<O> {

  private readonly logger: Logger = new Logger(AbstractModuleOptionsFactory.name);

  protected constructor(private readonly config: ConfigService, private readonly prefix?: string) {}

  abstract createOptions(): Promise<O> | O;

  protected readConfig<T extends PrimitiveType>(key: ConfigKey<T>): any {
    let keyName = key.name;
    if (this.prefix !== undefined) {
      keyName = `${this.prefix}.${keyName}`;
    }
    const value = this.config.get<T>(keyName);
    this.logger.verbose(`Klíč: ${keyName}=${value} (${key.type.name.toLowerCase()})`);

    if (value === undefined) {
      if (key.use === 'required') {
        this.logger.error(`Klíč ${key.name} nemá žádnou hodnotu, ale je vyžadován!`);
        process.exit(5);
      }

      return key.defaultValue;
    }

    switch (key.type.name.toLowerCase()) {
      case 'string':
        return value;
      case 'number':
        if (isNumberString(value)) {
          return Number(value);
        } else {
          this.showUnexpectedDataTypeMessage(value, key);
        }
        break;
      case 'boolean':
        if (isBooleanString(value)) {
          return value === 'true' || value === '1';
        } else {
          this.showUnexpectedDataTypeMessage(value, key);
        }
        break;
      default:
        this.logger.error('Hodnota neodpovídá žádnému podporovanému typu. Ukončuji aplikaci!');
        process.exit(7);
        throw new Error();
    }
  }

  private showUnexpectedDataTypeMessage<T extends PrimitiveType>(value: T, key: ConfigKey<T>) {
    this.logger.error(`Klíč s hodnotou: ${value} neodpovídá očekávánému datovému typu! Aktuální: ${typeof value} - očekávaný: ${key.type.name.toLowerCase()}!`);
    process.exit(6);
  }

}
