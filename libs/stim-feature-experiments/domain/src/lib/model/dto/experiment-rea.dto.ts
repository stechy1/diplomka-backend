import { IsEnum, IsInt, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { ExperimentREA, ReaOnResponseFail, ReaOutput, TvepOutput } from '@stechy1/diplomka-share';

import { DTO, IsNonPrimitiveArray } from '@diplomka-backend/stim-lib-common';

import { ExperimentDTO } from './experiment-dto';
import { ExperimentOutputDto } from './experiment-output.dto';

export class ExperimentReaDTO extends ExperimentDTO implements DTO, ExperimentREA {
  @Min(1, {
    always: true,
    context: {
      code: 1,
    },
  })
  cycleCount: number;

  @Min(1, {
    always: true,
    context: {
      code: 1,
    },
  })
  waitTimeMin: number;

  @Min(1, {
    always: true,
    context: {
      code: 1,
    },
  })
  waitTimeMax: number;

  @Min(1, {
    always: true,
    context: {
      code: 1,
    },
  })
  missTime: number;

  @IsEnum(ReaOnResponseFail)
  onFail: ReaOnResponseFail;

  @IsInt({
    always: true,
    context: {
      code: 1,
    },
  })
  @Min(0, {
    always: true,
    context: {
      code: 1,
    },
  })
  @Max(100, {
    always: true,
    context: {
      code: 1,
    },
  })
  brightness: number;

  @ValidateNested({
    always: true,
    context: {
      code: 1,
    },
  })
  @Type(() => ReaOutputDto)
  @IsNonPrimitiveArray({
    always: true,
    context: {
      code: 1,
    },
  })
  outputs: TvepOutput[];
}

export class ReaOutputDto extends ExperimentOutputDto implements ReaOutput {}
