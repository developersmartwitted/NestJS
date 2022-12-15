import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { ClientProjectEntity } from '../entities/clientProject.entity';
import { ProjectFileEntity } from '../../project/entities/projectFile.entity';

export class ClientProjectDto extends AbstractDto {
  @ApiProperty({
    description: 'Project name.',
  })
  name: string;

  @ApiProperty({
    description: 'Project url.',
  })
  url: string;

  @ApiProperty({
    description: 'Uploaded logo file name.',
  })
  logoName: string;

  @ApiProperty({
    description: 'Uploaded logo file location {folderName/filename.mimetype} .',
  })
  logoLocation: string;

  @ApiProperty({
    description: 'Uploaded logo mimetype.',
  })
  logoMimeType: string;

  @ApiProperty({
    description: 'Project description.',
  })
  description: string;

  @ApiProperty({
    description: 'UserId of the user who has add the education.',
    type: () => UserEntity,
  })
  user: UserEntity;

  @ApiPropertyOptional({
    description: 'Project files location which are stored in s3',
    type: () => ProjectFileEntity,
  })
  file: ProjectFileEntity;

  @ApiProperty({
    description: 'True if projcet is deleted',
  })
  isDeleted: boolean;

  constructor(clientProject: ClientProjectEntity) {
    super(clientProject);
    this.user = clientProject.user;
    this.logoName = clientProject.logoName;
    this.logoLocation = clientProject.logoLocation;
    this.logoMimeType = clientProject.logoMimeType;
    this.name = clientProject.name;
    this.url = clientProject.url;
    this.description = clientProject.description;
    this.file = clientProject.file;
    this.isDeleted = clientProject.isDeleted;
  }
}
