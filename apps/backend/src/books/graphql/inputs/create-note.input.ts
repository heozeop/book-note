import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateNoteInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  page?: number;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  isPublic?: boolean;
} 