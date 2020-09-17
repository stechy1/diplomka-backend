import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { interval, Observable, Subject } from 'rxjs';
import DoneCallback = jest.DoneCallback;

import { CommandFromStimulator } from '@stechy1/diplomka-share';

import { StimulatorStateData } from '@diplomka-backend/stim-feature-stimulator/domain';
import { SettingsFacade } from '@diplomka-backend/stim-feature-settings';

import { eventBusProvider, MockType } from 'test-helpers/test-helpers';

import { CommandIdService } from '../../service/command-id.service';
import { StimulatorService } from '../../service/stimulator.service';
import { createStimulatorServiceMock } from '../../service/stimulator.service.jest';
import { createCommandIdServiceMock } from '../../service/command-id.service.jest';
import { SerialService } from '../../service/serial.service';
import { createSerialServiceMock } from '../../service/serial.service.jest';
import { StimulatorEvent } from '../../events/impl/stimulator.event';
import { ExperimentClearedEvent } from '../../events/impl/experiment-cleared.event';
import { ExperimentClearCommand } from '../impl/experiment-clear.command';
import { ExperimentClearHandler } from './experiment-clear.handler';

describe('ExperimentClearHandler', () => {
  const defaultStimulatorRequestTimeout = 1000;
  let testingModule: TestingModule;
  let handler: ExperimentClearHandler;
  let service: MockType<StimulatorService>;
  let commandIdService: MockType<CommandIdService>;
  let eventBus: MockType<EventBus>;
  let settingsFacade: MockType<SettingsFacade>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        ExperimentClearHandler,
        {
          provide: StimulatorService,
          useFactory: createStimulatorServiceMock,
        },
        {
          provide: SerialService,
          useFactory: createSerialServiceMock,
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

    handler = testingModule.get<ExperimentClearHandler>(ExperimentClearHandler);
    // @ts-ignore
    service = testingModule.get<MockType<StimulatorService>>(StimulatorService);
    // @ts-ignore
    commandIdService = testingModule.get<MockType<CommandIdService>>(CommandIdService);
    // @ts-ignore
    eventBus = testingModule.get<MockType<EventBus>>(EventBus);
    // @ts-ignore
    settingsFacade = testingModule.get<MockType<SettingsFacade>>(SettingsFacade);
    settingsFacade.getSettings.mockReturnValue({ stimulatorResponseTimeout: defaultStimulatorRequestTimeout });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('positive - should call service without waiting for a response', async () => {
    const waitForResponse = false;
    const command = new ExperimentClearCommand(waitForResponse);

    await handler.execute(command);

    expect(service.clearExperiment).toBeCalled();
    expect(eventBus.publish).not.toBeCalled();
  });

  it('positive - should call service with waiting for a response', async () => {
    const waitForResponse = true;
    const commandID = 1;
    const stimulatorStateData: StimulatorStateData = {
      state: CommandFromStimulator.COMMAND_STIMULATOR_STATE_CLEARED,
      timestamp: Date.now(),
      noUpdate: true,
      name: 'StimulatorStateData',
    };
    const event: StimulatorEvent = new StimulatorEvent(commandID, stimulatorStateData);
    let lastKnownStimulatorState;
    const command = new ExperimentClearCommand(waitForResponse);
    const subject: Subject<any> = new Subject<any>();

    Object.defineProperty(commandIdService, 'counter', {
      get: jest.fn(() => commandID),
    });
    Object.defineProperty(service, 'lastKnownStimulatorState', {
      set: jest.fn((value) => (lastKnownStimulatorState = value)),
    });
    eventBus.pipe.mockReturnValueOnce(subject);
    service.clearExperiment.mockImplementationOnce(() => {
      subject.next(event);
      return Promise.resolve();
    });

    await handler.execute(command);

    expect(service.clearExperiment).toBeCalled();
    expect(lastKnownStimulatorState).toBe(stimulatorStateData.state);
    expect(eventBus.publish).toBeCalledWith(new ExperimentClearedEvent());
  });

  it('negative - should reject when callServiceMethod throw an error', async (done: DoneCallback) => {
    const waitForResponse = true;
    const commandID = 1;
    let lastKnownStimulatorState;
    const command = new ExperimentClearCommand(waitForResponse);
    const subject: Subject<any> = new Subject<any>();

    Object.defineProperty(commandIdService, 'counter', {
      get: jest.fn(() => commandID),
    });
    Object.defineProperty(service, 'lastKnownStimulatorState', {
      set: jest.fn((value) => (lastKnownStimulatorState = value)),
    });
    eventBus.pipe.mockReturnValueOnce(subject);
    service.clearExperiment.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await handler.execute(command);
      done.fail();
    } catch (e) {
      expect(service.clearExperiment).toBeCalled();
      expect(lastKnownStimulatorState).toBeUndefined();
      expect(eventBus.publish).not.toBeCalled();
      done();
    }
  });

  it('negative - should reject when timeout', async (done: DoneCallback) => {
    const waitForResponse = true;
    const commandID = 1;
    let lastKnownStimulatorState;
    const command = new ExperimentClearCommand(waitForResponse);
    const subject: Subject<any> = new Subject<any>();

    Object.defineProperty(commandIdService, 'counter', {
      get: jest.fn(() => commandID),
    });
    Object.defineProperty(service, 'lastKnownStimulatorState', {
      set: jest.fn((value) => (lastKnownStimulatorState = value)),
    });
    eventBus.pipe.mockImplementationOnce((...filters) => {
      let sub: Observable<any> = subject;
      for (const filter1 of filters) {
        sub = sub.pipe(filter1);
      }
      return sub;
    });
    service.clearExperiment.mockImplementationOnce(() => {
      return interval(defaultStimulatorRequestTimeout * 2).toPromise();
    });

    try {
      await handler.execute(command);
      done.fail();
    } catch (e) {
      expect(service.clearExperiment).toBeCalled();
      expect(lastKnownStimulatorState).toBeUndefined();
      expect(eventBus.publish).not.toBeCalled();
      done();
    }
  });
});
