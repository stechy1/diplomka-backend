import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';

import { createEmptyExperiment, createEmptyExperimentResult, Experiment, ExperimentResult, ExperimentType, Output } from '@stechy1/diplomka-share';
import {
  ExperimentResultEntity,
  ExperimentResultIdNotFoundException,
  ExperimentResultsRepository,
  experimentResultToEntity,
} from '@diplomka-backend/stim-feature-experiment-results/domain';

import { NoOpLogger } from 'test-helpers/test-helpers';

import { experimentResultsRepositoryProvider, repositoryExperimentResultEntityMock } from './repository-providers.jest';
import { ExperimentResultsService } from './experiment-results.service';

describe('Experiment results service', () => {
  let testingModule: TestingModule;
  let service: ExperimentResultsService;
  let experiment: Experiment<Output>;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        ExperimentResultsService,
        experimentResultsRepositoryProvider,
        {
          provide: EntityManager,
          useFactory: (rep) => ({ getCustomRepository: () => rep }),
          inject: [ExperimentResultsRepository],
        },
      ],
    }).compile();
    testingModule.useLogger(new NoOpLogger());

    service = testingModule.get<ExperimentResultsService>(ExperimentResultsService);

    experiment = createEmptyExperiment();
    experiment.id = 1;
    experiment.name = 'test';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('positive - should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('all()', () => {
    it('positive - should return all available experiment results', async () => {
      const experimentResult: ExperimentResult = createEmptyExperimentResult(experiment);
      const entityFromDB: ExperimentResultEntity = experimentResultToEntity(experimentResult);

      repositoryExperimentResultEntityMock.find.mockReturnValue([entityFromDB]);

      const result = await service.findAll();

      expect(result).toEqual([experimentResult]);
    });
  });

  describe('byId()', () => {
    it('positive - should return experiment by id', async () => {
      const experimentResult: ExperimentResult = createEmptyExperimentResult(experiment);
      experimentResult.id = 1;
      const userID = 0;
      const entityFromDB: ExperimentResultEntity = experimentResultToEntity(experimentResult);

      repositoryExperimentResultEntityMock.findOne.mockReturnValue(entityFromDB);

      const result = await service.byId(experimentResult.id, userID);

      expect(result).toEqual(experimentResult);
    });

    it('negative - should not return any experiment', () => {
      const experimentResultID = 1;
      const userID = 0;

      repositoryExperimentResultEntityMock.findOne.mockReturnValue(undefined);

      expect(() => service.byId(experimentResultID, userID)).rejects.toThrow(new ExperimentResultIdNotFoundException(experimentResultID));
    });
  });

  describe('insert()', () => {
    it('positive - should insert experiment result to database', async () => {
      const experimentResult: ExperimentResult = createEmptyExperimentResult(experiment);
      experimentResult.type = ExperimentType.CVEP;
      const userID = 0;
      const experimentResultEntityFromDB: ExperimentResultEntity = experimentResultToEntity(experimentResult);
      experimentResultEntityFromDB.userId = userID;

      repositoryExperimentResultEntityMock.insert.mockReturnValue({ raw: 1 });

      await service.insert(experimentResult, userID);

      expect(repositoryExperimentResultEntityMock.insert).toBeCalledWith(experimentResultEntityFromDB);
    });
  });

  describe('update()', () => {
    it('positive - should update existing experiment result in database', async () => {
      const experimentResult: ExperimentResult = createEmptyExperimentResult(experiment);
      experimentResult.id = 1;
      const userID = 0;
      const experimentResultEntityFromDB: ExperimentResultEntity = experimentResultToEntity(experimentResult);

      repositoryExperimentResultEntityMock.findOne.mockReturnValue(experimentResultEntityFromDB);

      await service.update(experimentResult, userID);

      expect(repositoryExperimentResultEntityMock.update).toBeCalledWith({ id: experimentResult.id }, experimentResultEntityFromDB);
    });

    it('negative - should not update non existing experiment result', () => {
      const experimentResult: ExperimentResult = createEmptyExperimentResult(experiment);
      experimentResult.id = 1;
      const userID = 0;
      repositoryExperimentResultEntityMock.findOne.mockReturnValue(undefined);

      expect(() => service.update(experimentResult, userID)).rejects.toThrow(new ExperimentResultIdNotFoundException(experimentResult.id));
    });
  });

  describe('delete()', () => {
    it('positive - should delete existing experiment result from database', async () => {
      const experimentResult: ExperimentResult = createEmptyExperimentResult(experiment);
      experimentResult.id = 1;
      const userID = 0;
      const experimentResultEntityFromDB: ExperimentResultEntity = experimentResultToEntity(experimentResult);

      repositoryExperimentResultEntityMock.findOne.mockReturnValue(experimentResultEntityFromDB);

      await service.delete(experimentResult.id, userID);

      expect(repositoryExperimentResultEntityMock.delete).toBeCalled();
    });

    it('negative - should not delete non existing experiment result', () => {
      const experimentResultID = 1;
      const userID = 0;

      repositoryExperimentResultEntityMock.findOne.mockReturnValue(undefined);

      expect(() => service.delete(experimentResultID, userID)).rejects.toThrow(new ExperimentResultIdNotFoundException(experimentResultID));
    });
  });

  describe('nameExists()', () => {
    let experimentResult: ExperimentResult;

    beforeEach(() => {
      experimentResult = createEmptyExperimentResult(createEmptyExperiment());
      experimentResult.name = 'test';
    });

    it('positive - new name should not exist in database for existing experimentResult', async () => {
      repositoryExperimentResultEntityMock.findOne.mockReturnValue(undefined);

      const result = await service.nameExists('random', experimentResult.id);

      expect(result).toBeFalsy();
    });

    it('negative - new name should exist in database for existing experimentResult', async () => {
      repositoryExperimentResultEntityMock.findOne.mockReturnValue(experimentResult);

      const result = await service.nameExists(experimentResult.name, experimentResult.id);

      expect(result).toBeTruthy();
    });
  });
});
