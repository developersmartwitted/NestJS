import { EntityRepository, Repository } from 'typeorm';

import { TemplateEntity } from '../entities/template.entity';

@EntityRepository(TemplateEntity)
export class TemplateRepository extends Repository<TemplateEntity> {}
