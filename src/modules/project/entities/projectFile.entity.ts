import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { ProjectFileDto } from '../dto/ProjectFileDto';
import { ProjectEntity } from './project.entity';
import { ClientProjectEntity } from '../../clientProject/entities/clientProject.entity';

@Entity({ name: 'project_file' })
export class ProjectFileEntity extends AbstractEntity<ProjectFileDto> {
  @ManyToOne(() => ProjectEntity, (project) => project.id, { nullable: true })
  project: ProjectEntity;

  @ManyToOne(() => ClientProjectEntity, (clientProject) => clientProject.id, {
    nullable: true,
  })
  clientProject: ClientProjectEntity;

  @Column()
  file: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  fileMimeType: string;

  dtoClass = ProjectFileDto;
}
