import { MessageCodes, Sequence } from '@stechy1/diplomka-share';

import { QueryError } from '../model/query-error';
import { BaseError } from '@diplomka-backend/stim-lib-common';

export class SequenceWasNotCreatedError extends BaseError {
  public readonly errorCode = MessageCodes.CODE_ERROR_SEQUENCE_NOT_CREATED;

  constructor(public readonly sequence: Sequence, public readonly error?: QueryError) {
    super();
  }
}