import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateThoughtDto } from "../dtos/create-thought.dto";
import { Thought } from "../entities/thought.entity";
import { ThoughtService } from "../services/thought.service";

@Controller("thoughts")
export class ThoughtController {
  constructor(private readonly thoughtService: ThoughtService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createThought(@Body() createThoughtDto: CreateThoughtDto): Promise<Thought> {
    return this.thoughtService.createThought(createThoughtDto);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getThought(@Param("id") id: string): Promise<Thought> {
    return this.thoughtService.getThoughtById(id);
  }

  @Get("note/:noteId")
  @UseGuards(JwtAuthGuard)
  async getThoughtsByNote(@Param("noteId") noteId: string): Promise<Thought[]> {
    return this.thoughtService.getThoughtsByNoteId(noteId);
  }

  @Get("parent/:parentId")
  @UseGuards(JwtAuthGuard)
  async getChildThoughts(@Param("parentId") parentId: string): Promise<Thought[]> {
    return this.thoughtService.getChildThoughts(parentId);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async updateThought(
    @Param("id") id: string,
    @Body() updateData: Partial<{
      text: string;
      orderIndex: number;
      strokeData: string;
    }>
  ): Promise<Thought> {
    return this.thoughtService.updateThought(id, updateData);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteThought(@Param("id") id: string): Promise<{ success: boolean }> {
    await this.thoughtService.deleteThought(id);
    return { success: true };
  }
} 