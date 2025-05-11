import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../../auth/guards/gql-auth.guard";
import { CreateStrokeDto } from "../dtos/create-stroke.dto";
import { Stroke } from "../entities/stroke.entity";
import { StrokeType } from "../graphql/types/stroke.type";
import { ThoughtType } from "../graphql/types/thought.type";
import { StrokeService } from "../services/stroke.service";
import { ThoughtService } from "../services/thought.service";

@Resolver(() => StrokeType)
export class StrokeResolver {
  constructor(
    private readonly strokeService: StrokeService,
    private readonly thoughtService: ThoughtService
  ) {}

  @Query(() => StrokeType)
  @UseGuards(GqlAuthGuard)
  async stroke(@Args("id") id: string): Promise<StrokeType> {
    const stroke = await this.strokeService.getStrokeById(id);
    return this.mapStrokeToType(stroke);
  }

  @Query(() => [StrokeType])
  @UseGuards(GqlAuthGuard)
  async thoughtStrokes(@Args("thoughtId") thoughtId: string): Promise<StrokeType[]> {
    const strokes = await this.strokeService.getStrokesByThoughtId(thoughtId);
    return strokes.map(stroke => this.mapStrokeToType(stroke));
  }

  @Mutation(() => StrokeType)
  @UseGuards(GqlAuthGuard)
  async createStroke(
    @Args("strokeInput") strokeInput: CreateStrokeDto
  ): Promise<StrokeType> {
    const stroke = await this.strokeService.createStroke(strokeInput);
    return this.mapStrokeToType(stroke);
  }

  @Mutation(() => StrokeType)
  @UseGuards(GqlAuthGuard)
  async updateStroke(
    @Args("id") id: string,
    @Args("strokeData") strokeData: string
  ): Promise<StrokeType> {
    const stroke = await this.strokeService.updateStroke(id, strokeData);
    return this.mapStrokeToType(stroke);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteStroke(@Args("id") id: string): Promise<boolean> {
    await this.strokeService.deleteStroke(id);
    return true;
  }

  @ResolveField(() => ThoughtType)
  async thought(@Parent() stroke: StrokeType): Promise<ThoughtType> {
    const thought = await this.thoughtService.getThoughtById(stroke.thought.id);
    return {
      id: thought.id,
      text: thought.text,
      orderIndex: thought.orderIndex,
      depth: thought.depth,
      inputType: thought.inputType,
      createdAt: thought.createdAt,
      updatedAt: thought.updatedAt,
      note: { id: thought.note.id } as any,
      parentThought: thought.parentThought ? { id: thought.parentThought.id } as any : undefined,
      childThoughts: undefined,
      strokes: undefined
    };
  }

  private mapStrokeToType(stroke: Stroke): StrokeType {
    return {
      id: stroke.id,
      strokeData: stroke.strokeData,
      sourceType: stroke.sourceType,
      createdAt: stroke.createdAt,
      updatedAt: stroke.updatedAt,
      thought: { id: stroke.thought.id } as any // Will be resolved by the resolver
    };
  }
} 