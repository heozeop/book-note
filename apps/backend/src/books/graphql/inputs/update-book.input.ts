import { Field, InputType, Int } from '@nestjs/graphql';
import { IsISBN, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

@InputType()
export class UpdateBookInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  author?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsISBN()
  isbn?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  publishedDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  publisher?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pageCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;
}
