import { EntityRepository, Repository } from 'typeorm';

import { ProjectInviteEntity } from '../entities/projectInvite.entity';

@EntityRepository(ProjectInviteEntity)
export class ProjectInviteRepository extends Repository<ProjectInviteEntity> {}
