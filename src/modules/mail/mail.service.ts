import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ClientProjectInviteEmailDto } from './dto/ClientProjectInviteEmailDto';
import { ConnectionInviteEmailDto } from './dto/ConnectionInviteEmailDto';
import { EmployerInviteEmailDto } from './dto/EmployerInviteEmailDto';
import { ProjectInviteEmailDto } from './dto/ProjectInviteEmailDto';
import { SkillInviteEmailDto } from './dto/SkillInviteEmailDto';
import { TeamInviteEmailDto } from './dto/TeamInviteEmailDto';

import { InternalServer } from '../../shared/http/message.http';
import { LoggerService } from '../../shared/providers/logger.service';

@Injectable()
export class MailService {
  private _name = 'PANOTON';

  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }

  private _from = 'support@panoton.com';
  public get from(): string {
    return this._from;
  }
  public set from(value: string) {
    this._from = value;
  }

  constructor(
    private readonly mailService: MailerService,
    private logger: LoggerService,
  ) {}

  /**
   * @description To format the given phone number as +1(000)000-0000 format
   * @param phoneNumberString Phone number of the user
   * @returns phone in +1(000)000-0000 format
   * @author Samsheer Alam
   */
  async formatPhoneNumber(phoneNumberString) {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      const intlCode = match[1] ? '+1' : '';
      return [intlCode, '(', match[2], ')', match[3], '-', match[4]].join('');
    }
    return phoneNumberString;
  }

  /**
   * @description Email to sent otp to verify the email
   * Called from auth service
   * @param toEmail to email address
   * @param otp Four digit otp
   * @author Samsheer Alam
   */
  async sendEmailOTP(toEmail: string, otp: number) {
    try {
      const subject = `Panoton: Email verification.`;
      await this.mailService.sendMail({
        from: { name: this.name, address: this.from },
        to: toEmail,
        subject: subject,
        template: 'send-email-otp',
        context: {
          otp: otp,
        },
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(InternalServer);
    }
  }

  /**
   * @description Email to send otp to verify the email to update password
   * Called from auth service
   * @param toEmail to email address
   * @param otp Four digit otp
   * @author Samsheer Alam
   */
  async sendForgotPasswordOTP(toEmail: string, otp: number) {
    try {
      const subject = `Panoton: Email verification.`;
      await this.mailService.sendMail({
        from: { name: this.name, address: this.from },
        to: toEmail,
        subject: subject,
        template: 'send-forgotpassword-otp',
        context: {
          otp: otp,
        },
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(InternalServer);
    }
  }

  /**
   * @description Email to send Team Invitation
   * called from teamService
   * @param emailInfo TeamInviteEmailDto
   * @author Samsheer Alam
   */
  async sendTeamInvite(emailInfo: TeamInviteEmailDto) {
    try {
      emailInfo.invitedByPhoneNumber = await this.formatPhoneNumber(
        emailInfo.invitedByPhoneNumber,
      );
      const subject = `Panoton: Team Invitation.`;
      await this.mailService.sendMail({
        from: { name: this.name, address: this.from },
        to: emailInfo.email,
        subject: subject,
        template: 'send-team-invite',
        context: emailInfo,
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(InternalServer);
    }
  }

  /**
   * @description Email to send Project Invitation
   * called from projectService
   * @param emailInfo ProjectInviteEmailDto
   * @author Samsheer Alam
   */
  async sendProjectInvite(emailInfo: ProjectInviteEmailDto) {
    try {
      emailInfo.invitedByPhoneNumber = await this.formatPhoneNumber(
        emailInfo.invitedByPhoneNumber,
      );
      const subject = `Panoton: Project Invitation.`;
      await this.mailService.sendMail({
        from: { name: this.name, address: this.from },
        to: emailInfo.email,
        subject: subject,
        template: 'send-project-invite',
        context: emailInfo,
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(InternalServer);
    }
  }

  /**
   * @description Email to send Connection Invitation
   * called from connectionService
   * @param emailInfo ConnectionInviteEmailDto
   * @author Samsheer Alam
   */
  async sendConnectionInvite(emailInfo: ConnectionInviteEmailDto) {
    try {
      const subject = `Panoton: Connection Invitation.`;
      emailInfo.invitedByPhoneNumber = await this.formatPhoneNumber(
        emailInfo.invitedByPhoneNumber,
      );
      await this.mailService.sendMail({
        from: { name: this.name, address: this.from },
        to: emailInfo.email,
        subject: subject,
        template: 'send-connection-invite',
        context: emailInfo,
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(InternalServer);
    }
  }

  /**
   * @description Email to send verification invite to verify user skill
   * called from skillService
   * @param emailInfo SkillInviteEmailDto
   * @author Samsheer Alam
   */
  async sendSkillVerificationInvite(emailInfo: SkillInviteEmailDto) {
    try {
      emailInfo.invitedByPhoneNumber = await this.formatPhoneNumber(
        emailInfo.invitedByPhoneNumber,
      );
      const subject = `Panoton: Invitation To Verify Skill.`;
      await this.mailService.sendMail({
        from: { name: this.name, address: this.from },
        to: emailInfo.email,
        subject: subject,
        template: 'send-skill-invite',
        context: emailInfo,
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(InternalServer);
    }
  }

  /**
   * @description Email to send verification invite to verify user employement
   * called from employmentService
   * @param emailInfo EmployerInviteEmailDto
   * @author Samsheer Alam
   */
  async sendEmploymentVerificationInvite(emailInfo: EmployerInviteEmailDto) {
    try {
      emailInfo.invitedByPhoneNumber = await this.formatPhoneNumber(
        emailInfo.invitedByPhoneNumber,
      );
      const subject = `Panoton: Invitation To Verify Employment Data.`;
      await this.mailService.sendMail({
        from: { name: this.name, address: this.from },
        to: emailInfo.email,
        subject: subject,
        template: 'send-employer-invite',
        context: emailInfo,
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(InternalServer);
    }
  }

  /**
   * @description Email to send verification invite to verify user client project
   * called from clientProjectService
   * @param emailInfo ClientProjectInviteEmailDto
   * @author Samsheer Alam
   */
  async sendClientProjectVerificationInvite(
    emailInfo: ClientProjectInviteEmailDto,
  ) {
    try {
      emailInfo.invitedByPhoneNumber = await this.formatPhoneNumber(
        emailInfo.invitedByPhoneNumber,
      );
      const subject = `Panoton: Invitation To Verify Project Detail.`;
      await this.mailService.sendMail({
        from: { name: this.name, address: this.from },
        to: emailInfo.email,
        subject: subject,
        template: 'send-clientproject-invite',
        context: emailInfo,
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(InternalServer);
    }
  }
}
