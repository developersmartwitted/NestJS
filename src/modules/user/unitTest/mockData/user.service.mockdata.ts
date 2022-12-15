import { Role } from '../../../auth/enums/role.enum';
import { SkillUserMapEntity } from '../../../skill/entities/skillUserMap.entity';
import { UserOTPEntity } from '../../entities/otp.entity';
import { ProfileEntity } from '../../entities/profile.entity';

export const userOTPMockData = {
  user: '4a993904-29ab-4a10-a0a7-f10c7de02af3',
  email: 'sometest@gmail.com',
  emailOtp: 1452,
  emailOtpSendAt: new Date('2022-05-27 10:14:56'),
  isEmailVerified: true,
  phoneNumber: '',
  phoneOtp: 2563,
  phoneOtpSendAt: new Date('2022-05-27 10:14:56'),
  isPhoneVerified: true,
  forgotPasswordOtp: 2586,
  passwordOtpSendAt: new Date('2022-05-27 10:14:56'),
};

export const userMockData = {
  id: '4a993904-29ab-4a10-a0a7-f10c7de02af3',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  roles: Role.USER,
  status: false,
  userOtp: new UserOTPEntity(),
  profile: new ProfileEntity(),
  skills: new SkillUserMapEntity(),
  invitedBy: '',
  createdAt: undefined,
  updatedAt: undefined,
};

export const foundUsersEmail = ['somtest@gmail.com'];

export const mockProfileData = {
  profileImage: '',
  hourlyRate: 0,
  about: '',
  externalLinks: '',
  address: '',
  state: '',
  country: '',
  phoneNumber: '',
  personalWebsite: '',
  domain: '',
  domainRole: '',
  reputationScore: '',
};

export const mockUserListData = {
  userId: '850dc8f4-4a4a-4827-976d-684d6a8aad52',
  firstName: 'Test',
  lastName: 'Account',
  email: 'sometest@gmail.com',
  status: true,
  profileImage: 'somelocation/image.jpg',
  hourlyRate: 32,
  about: 'Some personal info like about self',
  externalLinks: '',
  address: 'St George st',
  state: 'State name',
  country: 'India',
  phoneNumber: '+919940264655',
  personalWebsite: 'https://www.someurl.com',
  createdAt: '2022-06-06T05:51:41.587Z',
  connectionCount: 0,
  reputationScore: 21.18,
  isDiscourseUser: true,
};
