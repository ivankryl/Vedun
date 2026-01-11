import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateInsuredDto {
  @IsString()
  name!: string;

  @IsString()
  inn!: string;

  @IsOptional() @IsString()
  industry?: string;

  @IsOptional() @IsString()
  size?: string;

  @IsOptional()
  contacts?: any;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'TEST'])
  status?: 'ACTIVE' | 'INACTIVE' | 'TEST';
}
