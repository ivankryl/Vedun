import { IsOptional, IsString, Length } from 'class-validator';

export class CreateInsuredDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  inn?: string;

  @IsOptional() @IsString()
  contactName?: string;

  @IsOptional() @IsString() @Length(2, 2)
  industryCode?: string; // '01'

  @IsOptional() @IsString() @Length(1, 1)
  sizeCode?: string; // '1'
}
