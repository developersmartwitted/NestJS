import { EntityRepository, Repository } from 'typeorm';

import { ProjectFileEntity } from '../entities/projectFile.entity';

@EntityRepository(ProjectFileEntity)
export class ProjectFileRepository extends Repository<ProjectFileEntity> {}
