import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

import { InvitationType } from '../../../../shared/enums/invitationType.enums';
import { QuestionType } from '../../../reputationConstant/enums/questionType.enum';

const InviteTypes = {
  ...QuestionType,
  ...InvitationType,
};
type InviteTypes = QuestionType | InvitationType;

export class VerifyDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description:
      'Id which needs to be verified, It should be one of ClientProjectInvitationId, EmploymentInvitationId, or  SkillInvitationId',
  })
  verificationId: string;

  @IsEnum(InviteTypes)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Question type, SKILLS, CLIENT_PROJECT or EMPLOYMENT',
  })
  questionType: InviteTypes;
}
