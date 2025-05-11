import { BookStatus } from "@/books/entities/reading-status.entity";
import { registerEnumType } from "@nestjs/graphql";

// Register enum for GraphQL schema
registerEnumType(BookStatus, {
  name: "BookStatus",
  description: "Book reading status",
  valuesMap: {
    WANT_TO_READ: {
      description: "User wants to read this book",
    },
    READING: {
      description: "User is currently reading this book",
    },
    COMPLETED: {
      description: "User has completed reading this book",
    },
    DNF: {
      description: "User did not finish this book",
    },
  },
});
