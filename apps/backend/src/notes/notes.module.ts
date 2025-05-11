import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { StrokeController } from "./controllers/stroke.controller";
import { ThoughtController } from "./controllers/thought.controller";
import { Note } from "./entities/note.entity";
import { Stroke } from "./entities/stroke.entity";
import { Thought } from "./entities/thought.entity";
import { NoteRepository } from "./repositories/note.repository";
import { StrokeRepository } from "./repositories/stroke.repository";
import { ThoughtRepository } from "./repositories/thought.repository";
import { StrokeResolver } from "./resolvers/stroke.resolver";
import { ThoughtResolver } from "./resolvers/thought.resolver";
import { StrokeService } from "./services/stroke.service";
import { ThoughtService } from "./services/thought.service";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Note, Thought, Stroke],
    }),
  ],
  controllers: [ThoughtController, StrokeController],
  providers: [
    // Repositories
    NoteRepository,
    ThoughtRepository,
    StrokeRepository,

    // Services
    ThoughtService,
    StrokeService,

    // Resolvers
    ThoughtResolver,
    StrokeResolver,
  ],
  exports: [ThoughtService, StrokeService],
})
export class NotesModule {}
