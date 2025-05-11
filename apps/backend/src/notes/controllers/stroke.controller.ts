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
import { CreateStrokeDto } from "../dtos/create-stroke.dto";
import { Stroke } from "../entities/stroke.entity";
import { StrokeService } from "../services/stroke.service";

@Controller("strokes")
export class StrokeController {
  constructor(private readonly strokeService: StrokeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createStroke(
    @Body() createStrokeDto: CreateStrokeDto,
  ): Promise<Stroke> {
    return this.strokeService.createStroke(createStrokeDto);
  }

  @Get("thought/:thoughtId")
  @UseGuards(JwtAuthGuard)
  async getStrokesByThought(
    @Param("thoughtId") thoughtId: string,
  ): Promise<Stroke[]> {
    return this.strokeService.getStrokesByThoughtId(thoughtId);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getStroke(@Param("id") id: string): Promise<Stroke> {
    return this.strokeService.getStrokeById(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async updateStroke(
    @Param("id") id: string,
    @Body() updateData: { strokeData: string },
  ): Promise<Stroke> {
    return this.strokeService.updateStroke(id, updateData.strokeData);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteStroke(@Param("id") id: string): Promise<{ success: boolean }> {
    await this.strokeService.deleteStroke(id);
    return { success: true };
  }
}
