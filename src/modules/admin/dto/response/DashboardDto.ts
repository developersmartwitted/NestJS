import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserCountDto } from './UserCountDto';
export class DashboardDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'All users count.',
    type: UserCountDto,
  })
  allUser: UserCountDto;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Active users count.',
    type: UserCountDto,
  })
  activeUser: UserCountDto;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Inactive users count.',
    type: UserCountDto,
  })
  inActiveUser: UserCountDto;
}
