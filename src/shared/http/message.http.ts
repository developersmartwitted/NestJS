/**
 * @description common messages
 */
export const Success = 'Success';
export const UserAlreadyExists = 'User with this email is already registered';
export const UserNotFound = 'User not found';
export const InternalServer = 'Something went wrong, Please try later.';
export const UnAuthorized = 'Unauthorized. If not logged in.';
export const Forbidden = 'Forbidden, if permission denied.';
export const Verified = 'Successfully verified.';
export const InviteAlreadySent = 'Invitation already sent.';
export const InviteSelf = 'User can not send invite to self.';
export const InvalidVerifyId = 'Verification id is invalid.';
export const AlreadyRegistered =
  'User with the given email address is registered with panoton.';
export const InvitationLimit = 'You can not send more than 5 invitations.';
export const NotMoreThanOneInvite =
  'Invite can not be sent to more than one verifier.';

/**
 * @description Public route apis messages
 */
export const S3Url = 'S3 presigned url.';

/**
 * @description Auth route apis messages
 */
export const SentEmailOTP = 'Successfully sent OTP to the given email.';
export const OTPAlreadyVerified = 'OTP is already verified.';
export const OTPNotSent = 'No OTP is sent to the given email address.';
export const InvalidOTP = 'Invalid OTP.';
export const OTPVerified = 'OTP verified successfully.';
export const SentPhoneOTP = 'Successfully sent OTP to the given phone number.';
export const EmailUnverified = 'Email id not yet verified.';
export const UserRegistered = 'User successfully registered.';
export const EmailOrPhoneUnverified =
  'Email and phone number must be verified.';

export const LoggedIn = 'User successfully logged in.';
export const LoggedOut = 'User successfully logged out.';
export const InvalidCredential = 'Invalid credentials.';
export const Suspended = 'User is suspended.';
export const InvalidToken = 'Invalid refresh token.';
export const TokenNotFound = 'Refresh token not found from cookie.';

export const ForgotPassOTP =
  'Successfully sent OTP for forgot password to the given email.';
export const UpdatedPassword = 'Successfully updated the password.';
export const InvalidPassword = 'Current password is incorrect.';
export const UserInfo = 'User information.';
export const InvalidId = 'Invalid verification id.';

/**
 * @description User route apis messages
 */
export const ProfileInfo = 'Users profile informations.';
export const UpdatedProfile = 'Sucessfully updated user profile info.';

/**
 * @description Admin route apis messages
 */
export const UserList = 'Users List.';
export const UserStatus = 'User status is updated.';
export const DashboardInfo = 'Admin dashboard information.';
export const AdminSettingNotFound = 'Settings record not found.';
export const PlatformSetting = 'Platform settings data.';
export const UpdatePlatform = 'Successfully updated the platform record.';
export const AddedPlatformSetting =
  'Successfully added the new platform record.';

/**
 * Wallet route apis messages
 */
export const WalletInfo = 'Users wallet information.';

/**
 * Template route apis messages
 */
export const AddedTemplate = 'Added template Information.';
export const UpdatedTemplate = 'Updated template Information.';
export const PublishTemplate = 'Published template Information.';
export const TemplateList = 'All templates list.';
export const TemplateInfo = 'Template Information.';
export const TemplateNotFound = 'Template not found.';
export const TemplateDeleted = 'Successfully deleted the given template id.';

/**
 * Notification route api messages
 */
export const NotificationList = 'User notification list.';
export const AddNotifySetting = 'Added notification settings record.';
export const UpdateNotifySetting = 'Updated notification settings record.';
export const NotifySettingNotFound = 'Notification settings record not found.';
export const PresentNotifySetting =
  'Notification settings record already present.';

/**
 * Connection route api messages
 */
export const SentConnection =
  'Successfully send connection invite to the email.';
export const ConnectionInfo = 'Connection information.';
export const ConnectionRevoked = 'Successfully revoked the connection.';
export const InvalidConnection = 'Invalid connection id.';
export const UnableToRevoke = 'Sorry, you can not revoke this connection.';
export const AcceptConnection = 'Successfully accepted the invite connection.';

/**
 * Client Project route api messages
 */
export const ClientProjectAdded = 'Successfully added the client project.';
export const ClientProjectUpdated = 'Successfully updated the client project.';
export const ClientProjectNotFound = 'Client project record not found.';
export const ClientProjectInfo = 'Client project informations.';
export const ClientProjectDelete =
  'Deleted the record for give client project id.';
export const ClientProjectInvite = 'Send invite to verify client project data.';
export const ClientProjectQues = 'Client project questions.';

/**
 * Education route api messages
 */
export const EducationAdded = 'Successfully added education information.';
export const EducationUpdated = 'Successfully updated education information.';
export const EducationDeleted = 'Successfully deleted education information.';
export const EducationInfo = 'Education information.';
export const EducationNotFound = 'Education information not found.';

/**
 * Certification route api messages
 */
export const CertificateAdded = 'Successfully added certificate information.';
export const CertificateUpdated =
  'Successfully updated certificate information.';
export const CertificateDeleted =
  'Successfully deleted certificate information.';
export const CertificateInfo = 'Certificate information.';
export const CertificateNotFound = 'Certificate information not found.';

/**
 * Employment history route api messages
 */
export const EmploymentAdded = 'Successfully added the employment data.';
export const EmploymentUpdated = 'Successfully updated the employment data.';
export const EmploymentNotFound = 'Employment record not found.';
export const EmploymentInfo = 'Employment informations.';
export const EmploymentDelete = 'Deleted the record for give employment id.';
export const EmploymentInvite = 'Send invite to verify employment data.';
export const EmploymentQues = 'Employment questions.';

/**
 * Project route api messages
 */
export const ProjectCreated = 'Successfully created the project.';
export const ProjectUpdated = 'Successfully updated the project.';
export const ProjectDeleted = 'Successfully deleted the project.';
export const ProjectInfo = 'Project information.';
export const ProjectNotFound = 'Project information not found.';
export const ProjectInvalidStatus = 'Invalid status in query param.';
export const ProjectMember = 'List project members.';
export const MemberDeleted = 'Member deleted.';
export const ProjectAlreadyApplied = 'Already applied for the project.';
export const ProjectApplied = 'Successfully applied for the project.';
export const ProjectApplicantList = 'Project applicant list.';
export const ProjectAccepted = 'Successfully accepted the project.';
export const ProjectStatus = 'Updated project status.';
export const ProjectInvite =
  'Successfully sent invitation to the given email address.';

/**
 * Repuutation constants route api messages
 */
export const AddWeightage = 'Added new reputation weightage record.';
export const UpdatedWeightage = 'Updated reputation weightage record.';
export const WeightageInfo = 'Reputation weightage information.';
export const WeightageNotFound = 'Reputation weightage not found.';
export const WeightageConstrain =
  ' Basic, Advance and Skills must be 100% and sum of Education, Certification, Project and Employment must be 100%.';
export const QuestionCreated = 'New question record is added.';
export const AnswerCreated = 'New answer record for the question is added.';

/**
 * Team route api messages
 */
export const TeamAdded = 'Successfully added new team record.';
export const TeamUpdated = 'Successfully updated the team record.';
export const TeamInfo = 'Team information.';
export const TeamNotFound = 'Team record not found.';
export const TeamInvite = 'Successfully sent team invitation.';
export const TeamDeleted = 'Successfully team record deleted.';
export const TeamInviteAccept = 'Successfully accepted team invitation.';

/**
 * Skill route api messages
 */
export const SkillAdded = 'Successfully added new skill.';
export const SkillAlreadyPresent = 'Skill already added.';
export const SkillBulkUpload = 'Multiple skill added in DB.';
export const SkillInfo = 'Skill informations.';
export const SkillNotFound = 'Skill information not found.';
export const SkillInvite = 'Successfully sent invitation to verify the skill.';
export const SkillQuestion = 'Skill verification questions.';
export const DuplicateSkill = 'Duplicate skills cannot be added.';
export const SkillAlreadyVerified = 'Skill already verified.';
export const DuplicateSkillMember =
  'Duplicate members cannot be added to verify skills.';

/**
 * Community route api messages
 */
export const ComUserCreated = 'Successfully created user in discourse.';
export const ComPosts = 'List of all posts.';
export const ComTag = 'List of all tages.';
export const ComTagGroup = 'Successfully created tag group.';
export const ComCategory = 'List of all categories.';
export const ComTopicCreated = 'Successfully created a topic.';
export const ComTopics = 'List of all topics.';
export const ComPostReply = 'Successfully replied to post.';

/**
 * Stripe route api messages
 */

export const StripeAccountLinkCreated = 'Stripe account link has been created';
export const StripeAccountLinkRefreshed =
  'Stripe account link has been Refreshed';
export const StripeAccountNotFound = 'Stripe account not found';
export const StripeConnect = 'Send stripe connect to user';
export const StripeAccStatusUpdated = 'Stripe account status has been updated';
export const InvoiceSent = 'Invoice sent sucessfully.';
export const InvoiceList = 'List of invoices.';
export const InvoiceVerified = 'Invoice successfully verified.';
export const InvoiceNotVerified = 'Invoice not yet verfied.';
export const InvoiceNotFound = 'Invoice not found.';
export const StripeAccountInfo = 'Stripe Account info.';
