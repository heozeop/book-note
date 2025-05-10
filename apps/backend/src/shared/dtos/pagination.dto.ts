import { Type } from '@nestjs/common';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsPositive, Max, Min } from 'class-validator';

/**
 * Input DTO for pagination
 */
@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1, description: 'Page number (1-based)' })
  @IsPositive()
  @Min(1)
  page: number = 1;
  
  @Field(() => Int, { defaultValue: 20, description: 'Items per page' })
  @IsPositive()
  @Max(100)
  limit: number = 20;
}

/**
 * Paginated result for GraphQL
 */
export function Paginated<T>(classRef: Type<T>): any {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [classRef], { description: 'List of items' })
    items: T[];
    
    @Field(() => Int, { description: 'Total number of items' })
    total: number;
    
    @Field(() => Int, { description: 'Current page number' })
    page: number;
    
    @Field(() => Int, { description: 'Number of items per page' })
    limit: number;
    
    @Field(() => Int, { description: 'Total number of pages' })
    pages: number;
    
    @Field(() => Boolean, { description: 'Whether there is a next page' })
    hasNext: boolean;
    
    @Field(() => Boolean, { description: 'Whether there is a previous page' })
    hasPrevious: boolean;
  }
  
  return PaginatedType;
}

/**
 * Data for paginated results
 */
export class PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  
  constructor(items: T[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
  
  get pages(): number {
    return Math.ceil(this.total / this.limit);
  }
  
  get hasNext(): boolean {
    return this.page < this.pages;
  }
  
  get hasPrevious(): boolean {
    return this.page > 1;
  }
} 