import { BaseError } from '@diplomka-backend/stim-lib-common';
import { MessageCodes } from '@stechy1/diplomka-share';

export class PortIsAlreadyOpenException extends BaseError {
  public readonly errorCode = MessageCodes.CODE_ERROR_LOW_LEVEL_PORT_ALREADY_OPEN;
}
