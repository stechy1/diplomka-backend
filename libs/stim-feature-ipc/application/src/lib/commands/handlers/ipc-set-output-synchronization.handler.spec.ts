import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable, Subject } from 'rxjs';

import { ConnectionStatus } from '@stechy1/diplomka-share';

import { CommandIdService } from '@diplomka-backend/stim-lib-common';
import { SettingsFacade } from '@diplomka-backend/stim-feature-settings';
import { ToggleOutputSynchronizationMessage, IpcMessage } from '@diplomka-backend/stim-feature-ipc/domain';

import { createCommandIdServiceMock, eventBusProvider, MockType, NoOpLogger } from 'test-helpers/test-helpers';

import { IpcService } from '../../services/ipc.service';
import { createIpcServiceMock } from '../../services/ipc.service.jest';
import { IpcBlockingCommandFailedEvent } from '../../event/impl/ipc-blocking-command-failed.event';
import { IpcEvent } from '../../event/impl/ipc.event';
import { IpcOutputSynchronizationUpdatedEvent } from '../../event/impl/ipc-output-synchronization-updated.event';
import { IpcSetOutputSynchronizationCommand } from '../impl/ipc-set-output-synchronization.command';
import { IpcSetOutputSynchronizationHandler } from './ipc-set-output-synchronization.handler';

describe('IpcSetOutputSynchronizationHandler', () => {
  const defaultIpcRequestTimeout = 1000;
  let testingModule: TestingModule;
  let handler: IpcSetOutputSynchronizationHandler;
  let service: MockType<IpcService>;
  let commandIdService: MockType<CommandIdService>;
  let eventBus: MockType<EventBus>;
  let settingsFacade: MockType<SettingsFacade>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        IpcSetOutputSynchronizationHandler,
        {
          provide: IpcService,
          useFactory: createIpcServiceMock,
        },
        {
          provide: CommandIdService,
          useFactory: createCommandIdServiceMock,
        },
        {
          provide: SettingsFacade,
          useFactory: jest.fn(() => ({ getSettings: jest.fn() })),
        },
        eventBusProvider,
      ],
    }).compile();
    testingModule.useLogger(new NoOpLogger());

    handler = testingModule.get<IpcSetOutputSynchronizationHandler>(IpcSetOutputSynchronizationHandler);
    // @ts-ignore
    service = testingModule.get<MockType<IpcService>>(IpcService);
    // @ts-ignore
    commandIdService = testingModule.get<MockType<CommandIdService>>(CommandIdService);
    // @ts-ignore
    eventBus = testingModule.get<MockType<EventBus>>(EventBus);
    // @ts-ignore
    settingsFacade = testingModule.get<MockType<SettingsFacade>>(SettingsFacade);
    settingsFacade.getSettings.mockReturnValue({ assetPlayerResponseTimeout: defaultIpcRequestTimeout });
    Object.defineProperty(service, 'status', {
      get: jest.fn(() => ConnectionStatus.CONNECTED),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('positive - should call service without waiting for a response', async () => {
    const synchronize = false;
    const waitForResponse = false;
    const userID = 1;
    const experimentID = 1;
    const command = new IpcSetOutputSynchronizationCommand(synchronize, userID, experimentID, waitForResponse);
    const requestMessage: ToggleOutputSynchronizationMessage = new ToggleOutputSynchronizationMessage(synchronize);

    await handler.execute(command);

    expect(service.send).toBeCalledWith(requestMessage);
    expect(eventBus.publish).not.toBeCalled();
  });

  it('positive - should call service with waiting for a response', async () => {
    const synchronize = false;
    const waitForResponse = true;
    const userID = 1;
    const experimentID = 1;
    const commandID = 1;
    const requestMessage: ToggleOutputSynchronizationMessage = new ToggleOutputSynchronizationMessage(synchronize, commandID);
    const responseMessage: IpcMessage<void> = { commandID, topic: 'test', data: null };
    const event: IpcEvent<void> = new IpcEvent(responseMessage);
    const command = new IpcSetOutputSynchronizationCommand(synchronize, userID, experimentID, waitForResponse);
    const subject: Subject<any> = new Subject<any>();

    Object.defineProperty(commandIdService, 'counter', {
      get: jest.fn(() => commandID),
    });
    eventBus.pipe.mockReturnValueOnce(subject);
    service.send.mockImplementationOnce(() => {
      subject.next(event);
      return Promise.resolve();
    });

    await handler.execute(command);

    expect(service.send).toBeCalledWith(requestMessage);
    expect(eventBus.publish).toBeCalledWith(new IpcOutputSynchronizationUpdatedEvent(command.synchronize, command.userID, command.experimentID));
  });

  it('negative - should reject when callServiceMethod throw an error', async () => {
    const synchronize = false;
    const userID = 1;
    const experimentID = 1;
    const waitForResponse = true;
    const commandID = 1;
    const command = new IpcSetOutputSynchronizationCommand(synchronize, userID, experimentID, waitForResponse);
    const subject: Subject<any> = new Subject<any>();

    Object.defineProperty(commandIdService, 'counter', {
      get: jest.fn(() => commandID),
    });
    eventBus.pipe.mockReturnValueOnce(subject);
    service.send.mockImplementationOnce(() => {
      throw new Error();
    });

    expect(() => handler.execute(command)).rejects.toThrow(new Error());
    expect(eventBus.publish).not.toBeCalled();
  });

  it('negative - should reject when call synchronize without experiment id', () => {
    const synchronize = true;
    const userID = 1;
    const experimentID = undefined;
    const waitForResponse = true;
    const command = new IpcSetOutputSynchronizationCommand(synchronize, userID, experimentID, waitForResponse);

    expect(() => handler.execute(command)).rejects.toThrow(new Error());
    expect(eventBus.publish).not.toBeCalled();
  });

  it('negative - should reject when timeout', async () => {
    const synchronize = false;
    const userID = 1;
    const experimentID = 1;
    const waitForResponse = true;
    const commandID = 1;
    const requestMessage: ToggleOutputSynchronizationMessage = new ToggleOutputSynchronizationMessage(synchronize, commandID);
    const command = new IpcSetOutputSynchronizationCommand(synchronize, userID, experimentID, waitForResponse);
    const subject: Subject<any> = new Subject<any>();

    Object.defineProperty(commandIdService, 'counter', {
      get: jest.fn(() => commandID),
    });
    eventBus.pipe.mockImplementationOnce((...filters) => {
      let sub: Observable<any> = subject;
      for (const filter1 of filters) {
        sub = sub.pipe(filter1);
      }
      return sub;
    });
    service.send.mockImplementationOnce(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, defaultIpcRequestTimeout * 2);
      });
    });

    try {
      await handler.execute(command);
    } catch (e) {
      expect(service.send).toBeCalledWith(requestMessage);
      expect(eventBus.publish).toBeCalledWith(new IpcBlockingCommandFailedEvent('toggle-output-synchronization'));
    }
  });
});
