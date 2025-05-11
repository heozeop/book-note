import { BookStatus } from "@/books/entities/book.entity";
import { registerEnumType } from "@nestjs/graphql";

// Register enum for GraphQL schema
registerEnumType(BookStatus, {
  name: "BookStatus",
  description: "The status of a book",
  valuesMap: {
    WANT_TO_READ: {
      description: "Want to read",
    },
    READING: {
      description: "Currently reading",
    },
    COMPLETED: {
      description: "Completed reading",
    },
    DNF: {
      description: "Did not finish",
    },
  },
});
