import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { FileBrowserService } from '../../../domain/service/file-browser.service';
import { MergePrivatePathQuery } from '../impl/merge-private-path.query';
import { Logger } from '@nestjs/common';

@QueryHandler(MergePrivatePathQuery)
export class MergePrivatePathHandler
  implements IQueryHandler<MergePrivatePathQuery, string> {
  private readonly logger: Logger = new Logger(MergePrivatePathHandler.name);
  constructor(private readonly service: FileBrowserService) {}

  async execute(query: MergePrivatePathQuery): Promise<string> {
    this.logger.debug(`Budu tvořit privátní cestu k: '${query.path}'.`);
    return this.service.mergePrivatePath(query.path);
  }
}