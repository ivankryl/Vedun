import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateInsuredDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsDateString()
  birthDate: string;
}
