import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Sequence } from '@stechy1/diplomka-share';

import { SequencesService } from '../../../domain/services/sequences.service';
import { SequenceIdNotFoundError } from '../../../domain/exception/sequence-id-not-found.error';
import { SequenceByIdQuery } from '../impl/sequence-by-id.query';

@QueryHandler(SequenceByIdQuery)
export class SequenceByIdHandler
  implements IQueryHandler<SequenceByIdQuery, Sequence> {
  constructor(private readonly service: SequencesService) {}

  async execute(query: SequenceByIdQuery): Promise<Sequence> {
    const sequence = await this.service.byId(query.sequenceID);
    if (!sequence) {
      throw new SequenceIdNotFoundError(query.sequenceID);
    }

    return sequence;
  }
}
