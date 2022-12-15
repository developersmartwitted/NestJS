import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProjectEntity } from '../entities/project.entity';
import { ProjectStatus } from '../enums/projectStatus.enum';
import { SkillMapEntity } from '../../skill/entities/skillMap.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { ProjectFileEntity } from '../entities/projectFile.entity';

export class ProjectDto extends AbstractDto {
  @ApiProperty({
    description: 'Title for the project.',
  })
  name: string;

  @ApiProperty({
    description: 'Project description.',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Project logo image name.',
  })
  readonly projectLogoName: string;

  @ApiPropertyOptional({
    description:
      'Project logo image location (i.e) Uploaded file location {folderName/filename.mimetype}.',
  })
  readonly projectLogoLocation: string;

  @ApiPropertyOptional({
    description: 'Project logo image mime type (jpg, png etc).',
  })
  readonly projectLogoMimeType: string;

  @ApiProperty({
    description: 'Project budget.',
  })
  budget: string;

  @ApiProperty({
    description: 'UserId of the user who has created the project.',
    type: () => UserEntity,
  })
  user: UserEntity;

  @ApiPropertyOptional({
    description: 'Project files location which are stored in s3',
    type: () => SkillMapEntity,
  })
  skill: SkillMapEntity;

  @ApiPropertyOptional({
    description: 'Project files location which are stored in s3',
    type: () => ProjectFileEntity,
  })
  file: ProjectFileEntity;

  @ApiProperty({
    description: 'Defines whether it is of type invite or apply or create.',
    enum: ProjectStatus,
  })
  status: ProjectStatus;

  @ApiProperty({
    description: 'True if projcet is deleted',
  })
  isDeleted: boolean;

  constructor(project: ProjectEntity) {
    super(project);
    this.name = project.name;
    this.description = project.description;
    this.projectLogoName = project.projectLogoName;
    this.projectLogoLocation = project.projectLogoLocation;
    this.projectLogoMimeType = project.projectLogoMimeType;
    this.budget = project.budget;
    this.status = project.status;
    this.skill = project.skill;
    this.user = project.user;
    this.file = project.file;
    this.isDeleted = project.isDeleted;
  }
}
