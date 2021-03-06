import { ValidationError } from '@nestjs/common';

import { MessageCodes } from '@stechy1/diplomka-share';

import { ControllerException, transformValidationErrors } from '@diplomka-backend/stim-lib-common';

export function classValidatorExceptionFactory(errors: ValidationError[]): any {
  throw new ControllerException(MessageCodes.CODE_ERROR, { errors: transformValidationErrors(errors) });
}
