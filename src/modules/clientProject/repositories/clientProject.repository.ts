import { EntityRepository, Repository } from 'typeorm';
import { ClientProjectDto } from '../dto/ClientProjectDto';

import { ClientProjectEntity } from '../entities/clientProject.entity';

@EntityRepository(ClientProjectEntity)
export class ClientProjectRepository extends Repository<ClientProjectEntity> {
  /**
   * @description Fetches all the list of active client project data
   * @param userId Logged in users id
   * @returns Client project list with verifiers info(invite data)
   */
  async getClientProjectInfo(userId: string): Promise<ClientProjectDto[]> {
    return this.createQueryBuilder('client_project')
      .where('client_project.user_id = :userId', { userId })
      .andWhere('client_project.is_deleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('client_project.file', 'project_file')
      .leftJoinAndSelect(
        'client_project.clientProjectVerify',
        'client_project_verification',
      )
      .leftJoinAndSelect('client_project_verification.verifier', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .getMany();
  }
}
