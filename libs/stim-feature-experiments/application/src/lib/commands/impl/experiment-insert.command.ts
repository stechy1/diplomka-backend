import { ICommand } from '@nestjs/cqrs';

import { Experiment, Output } from '@stechy1/diplomka-share';

export class ExperimentInsertCommand implements ICommand {
  constructor(public readonly experiment: Experiment<Output>, public readonly userID: number) {}
}
