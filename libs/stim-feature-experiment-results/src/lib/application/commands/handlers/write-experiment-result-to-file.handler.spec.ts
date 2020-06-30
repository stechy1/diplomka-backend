import { Test, TestingModule } from '@nestjs/testing';

import { createEmptyExperiment, createEmptyExperimentResult, ExperimentResult } from '@stechy1/diplomka-share';

import { FileBrowserFacade } from '@diplomka-backend/stim-feature-file-browser';

import { MockType } from 'test-helpers/test-helpers';

import { ExperimentResultsService } from '../../../domain/services/experiment-results.service';
import { createExperimentResultsServiceMock } from '../../../domain/services/experiment-results.service.jest';
import { WriteExperimentResultToFileCommand } from '../impl/write-experiment-result-to-file.command';
import { WriteExperimentResultToFileHandler } from './write-experiment-result-to-file.handler';

describe('WriteExperimentResultToFileHandler', () => {
  let testingModule: TestingModule;
  let handler: WriteExperimentResultToFileHandler;
  let service: MockType<ExperimentResultsService>;
  let facade: MockType<FileBrowserFacade>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        WriteExperimentResultToFileHandler,
        {
          provide: ExperimentResultsService,
          useFactory: createExperimentResultsServiceMock,
        },
        {
          provide: FileBrowserFacade,
          useFactory: jest.fn(() => ({
            mergePrivatePath: jest.fn(),
            writePrivateJSONFile: jest.fn(),
          })),
        },
      ],
    }).compile();

    handler = testingModule.get<WriteExperimentResultToFileHandler>(WriteExperimentResultToFileHandler);
    // @ts-ignore
    service = testingModule.get<MockType<ExperimentResultsService>>(ExperimentResultsService);
    // @ts-ignore
    facade = testingModule.get<MockType<FileBrowserFacade>>(FileBrowserFacade);
  });

  afterEach(() => {
    facade.mergePrivatePath.mockClear();
    facade.writePrivateJSONFile.mockClear();
  });

  it('positive - should write experiment result data to file', async () => {
    const resultData = [];
    const experimentResult: ExperimentResult = createEmptyExperimentResult(createEmptyExperiment());
    experimentResult.filename = 'filename.json';
    const filePath = 'file/path';
    const command = new WriteExperimentResultToFileCommand();

    Object.defineProperty(service, 'activeExperimentResultData', {
      get: jest.fn(() => resultData),
    });
    Object.defineProperty(service, 'activeExperimentResult', {
      get: jest.fn(() => experimentResult),
    });
    facade.mergePrivatePath.mockReturnValue(filePath);

    await handler.execute(command);

    expect(facade.writePrivateJSONFile).toBeCalledWith(filePath, resultData);
  });
});
