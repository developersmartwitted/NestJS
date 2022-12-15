import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProjectStatus } from '../../enums/projectStatus.enum';

export class UpdateProjectStatusDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project id in which is to applied.',
  })
  readonly projectId: string;

  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project status, which needs to be updated to.',
  })
  readonly projectStatus: ProjectStatus;
}
