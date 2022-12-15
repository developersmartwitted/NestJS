import { EntityRepository, Repository } from 'typeorm';

import { PlatformSettingsEntity } from '../entities/platformSettings.entity';

@EntityRepository(PlatformSettingsEntity)
export class PlatformSettingsRepository extends Repository<PlatformSettingsEntity> {}
