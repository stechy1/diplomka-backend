import { MockType } from 'test-helpers/test-helpers';

import { SequencesService } from './sequences.service';

export const createSequencesServiceMock: () => MockType<SequencesService> = jest.fn(() => ({
  findAll: jest.fn(),
  byId: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  nameExists: jest.fn(),
}));
