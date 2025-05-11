import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "../../auth/guards/gql-auth.guard";
import { CreateThoughtDto } from "../dtos/create-thought.dto";
import { Thought } from "../entities/thought.entity";
import { StrokeType } from "../graphql/types/stroke.type";
import { ThoughtType } from "../graphql/types/thought.type";
import { StrokeService } from "../services/stroke.service";
import { ThoughtService } from "../services/thought.service";

@Resolver(() => ThoughtType)
export class ThoughtResolver {
  constructor(
    private readonly thoughtService: ThoughtService,
    private readonly strokeService: StrokeService
  ) {}

  @Query(() => ThoughtType)
  @UseGuards(GqlAuthGuard)
  async thought(@Args("id") id: string): Promise<ThoughtType> {
    const thought = await this.thoughtService.getThoughtById(id);
    return this.mapThoughtToType(thought);
  }

  @Query(() => [ThoughtType])
  @UseGuards(GqlAuthGuard)
  async thoughtsByNote(@Args("noteId") noteId: string): Promise<ThoughtType[]> {
    const thoughts = await this.thoughtService.getThoughtsByNoteId(noteId);
    return thoughts.map(thought => this.mapThoughtToType(thought));
  }

  @Query(() => [ThoughtType])
  @UseGuards(GqlAuthGuard)
  async childThoughts(@Args("parentId") parentId: string): Promise<ThoughtType[]> {
    const thoughts = await this.thoughtService.getChildThoughts(parentId);
    return thoughts.map(thought => this.mapThoughtToType(thought));
  }

  @Mutation(() => ThoughtType)
  @UseGuards(GqlAuthGuard)
  async createThought(
    @Args("thoughtInput") thoughtInput: CreateThoughtDto
  ): Promise<ThoughtType> {
    const thought = await this.thoughtService.createThought(thoughtInput);
    return this.mapThoughtToType(thought);
  }

  @Mutation(() => ThoughtType)
  @UseGuards(GqlAuthGuard)
  async updateThought(
    @Args("id") id: string,
    @Args("text", { nullable: true }) text?: string,
    @Args("orderIndex", { nullable: true }) orderIndex?: number,
    @Args("strokeData", { nullable: true }) strokeData?: string
  ): Promise<ThoughtType> {
    const updateData: any = {};
    if (text !== undefined) updateData.text = text;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;
    if (strokeData !== undefined) updateData.strokeData = strokeData;
    
    const thought = await this.thoughtService.updateThought(id, updateData);
    return this.mapThoughtToType(thought);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteThought(@Args("id") id: string): Promise<boolean> {
    await this.thoughtService.deleteThought(id);
    return true;
  }

  @ResolveField(() => [StrokeType])
  async strokes(@Parent() thought: ThoughtType): Promise<StrokeType[]> {
    const strokes = await this.strokeService.getStrokesByThoughtId(thought.id);
    return strokes.map(stroke => ({
      id: stroke.id,
      strokeData: stroke.strokeData,
      sourceType: stroke.sourceType,
      createdAt: stroke.createdAt,
      updatedAt: stroke.updatedAt,
      thought: thought
    }));
  }

  private mapThoughtToType(thought: Thought): ThoughtType {
    return {
      id: thought.id,
      text: thought.text,
      orderIndex: thought.orderIndex,
      depth: thought.depth,
      inputType: thought.inputType,
      createdAt: thought.createdAt,
      updatedAt: thought.updatedAt,
      note: { id: thought.note.id } as any, // Will be resolved by NoteResolver
      parentThought: thought.parentThought ? { id: thought.parentThought.id } as any : undefined,
      childThoughts: undefined, // Will be fetched by the resolver if needed
      strokes: undefined // Will be fetched by the resolver if needed
    };
  }
} 