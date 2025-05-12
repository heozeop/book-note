import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { CollectionController } from "../../controllers/collection.controller";
import { CollectionResolver } from "../../resolvers/collection.resolver";
import { BookCollection, Collection } from "./entities";
import { BookCollectionRepository, CollectionRepository } from "./repositories";
import { CollectionService } from "./services";

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [
        Collection,
        BookCollection
      ],
    })
  ],
  controllers: [
    CollectionController
  ],
  providers: [
    CollectionService,
    CollectionRepository,
    BookCollectionRepository,
    CollectionResolver
  ],
  exports: [
    CollectionService,
    CollectionRepository,
    BookCollectionRepository
  ]
})
export class CollectionsModule {} 