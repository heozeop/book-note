import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

@InputType()
export class CreateStrokeDto {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  thoughtId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  strokeData: string; // JSON stringified stroke data
}
