import { EventEmitter } from 'events';
import { Logger } from '@nestjs/common';

import { PortIsUnableToOpenException, SerialPort } from '@diplomka-backend/stim-feature-stimulator/domain';

import { SerialPortFactory } from './serial-port.factory';

/**
 * Továrna na instance fake sériového portu.
 *
 * Veškerá data, která se na port zapíšou, tak se objeví v data handleru
 */
export class FakeSerialPortFactory extends SerialPortFactory {
  public static readonly VIRTUAL_PORT_NAME = 'virtual';
  private readonly logger: Logger = new Logger(FakeSerialPortFactory.name);

  createSerialPort(path: string, settings: Record<string, unknown>, callback: (error?: Error | null) => void): SerialPort {
    // Pro simulaci selhání otevření sériového portu
    // se v této podmínce zkontroluje název portu, pokud neodpovídá, vyhodí se vyjímka
    if (path !== FakeSerialPortFactory.VIRTUAL_PORT_NAME) {
      throw new PortIsUnableToOpenException();
    }

    this.logger.verbose('Vytvářím instanci fake sériové linky.');
    return new FakeSerialPort(callback);
  }

  list(): Promise<Record<string, unknown>[]> {
    return Promise.resolve([{ path: FakeSerialPortFactory.VIRTUAL_PORT_NAME }]);
  }
}

export class FakeSerialPort implements SerialPort {
  private readonly _emitter: EventEmitter = new EventEmitter();

  constructor(callback: (error: unknown) => void) {
    setTimeout(() => {
      this.callOpenErrorCallback(callback);
    }, 1000);
  }

  protected callOpenErrorCallback(callback: (error?: Error | null) => void): void {
    callback();
  }

  protected callCloseErrorCallback(callback: (error?: Error | null) => void): void {
    callback();
  }

  close(callback: (error?: Error | null) => void): void {
    setTimeout(() => {
      this._emitter.emit('close');
      this.callCloseErrorCallback(callback);
    }, 1000);
  }

  on(event: string, callback: (data?: any) => void): SerialPort {
    this._emitter.on(event, callback);
    return this;
  }

  pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean }): T {
    // Tady nebude žádná implementace
    // Metoda je potřeba hlavně u reálné sériové linky, kde se vkládá delimiter parser
    // U FakeSerial se nic takového dělat nemusí
    return (this as unknown) as T;
  }

  write(data: string | number[] | Buffer, callback?: (error: Error, bytesWritten: number) => void): boolean {
    this._emitter.emit('data', data);
    return true;
  }
}
