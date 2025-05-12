import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { BookTagController, TagController } from "../../controllers/tag.controller";
import { BookTag, PageNoteTag, Tag } from "./entities";
import { BookTagRepository, PageNoteTagRepository, TagRepository } from "./repositories";
import { TagService } from "./services";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [
        Tag,
        BookTag,
        PageNoteTag
      ],
    })
  ],
  controllers: [
    TagController,
    BookTagController
  ],
  providers: [
    TagService,
    TagRepository,
    BookTagRepository,
    PageNoteTagRepository
  ],
  exports: [
    TagService,
    TagRepository,
    BookTagRepository,
    PageNoteTagRepository
  ]
})
export class TagsModule {} 