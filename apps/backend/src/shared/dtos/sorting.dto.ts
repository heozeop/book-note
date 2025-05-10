import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * Sort direction enum
 */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Register enum for GraphQL
registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Sort direction (ascending or descending)',
});

/**
 * Input DTO for sorting
 */
@InputType()
export class SortInput {
  @Field(() => String, { description: 'Field to sort by' })
  @IsString()
  field: string;
  
  @Field(() => SortDirection, { defaultValue: SortDirection.ASC, description: 'Sort direction' })
  @IsEnum(SortDirection)
  @IsOptional()
  direction: SortDirection = SortDirection.ASC;
} 