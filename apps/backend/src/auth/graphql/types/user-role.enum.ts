import { UserRole } from "@/auth/entities/user.entity";
import { registerEnumType } from "@nestjs/graphql";

// Register UserRole enum with GraphQL
registerEnumType(UserRole, {
  name: "UserRole",
  description: "The role of the user",
});
