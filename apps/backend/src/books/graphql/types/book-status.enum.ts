import { BookStatus } from "@/books/entities/book.entity";
import { registerEnumType } from "@nestjs/graphql";

// Register enum for GraphQL schema
registerEnumType(BookStatus, {
  name: "BookStatus",
  description: "Status of a book in the reading journey",
}); 