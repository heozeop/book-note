import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { PageNoteController } from "./controllers/page-note.controller";
import { PageNote, Quote, Reaction, Stroke, Thought } from "./entities";
import {
    PageNoteRepository,
    QuoteRepository,
    ReactionRepository,
    StrokeRepository,
    ThoughtRepository
} from "./repositories";
import { PageNoteResolver } from "./resolvers/page-note.resolver";
import { PageNoteService } from "./services";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [
        PageNote,
        Quote,
        Thought,
        Stroke,
        Reaction
      ],
    })
  ],
  controllers: [
    PageNoteController
  ],
  providers: [
    PageNoteService,
    PageNoteRepository,
    QuoteRepository,
    ThoughtRepository,
    StrokeRepository,
    ReactionRepository,
    PageNoteResolver
  ],
  exports: [
    PageNoteService,
    PageNoteRepository,
    QuoteRepository,
    ThoughtRepository,
    StrokeRepository,
    ReactionRepository
  ]
})
export class NotesModule {} 