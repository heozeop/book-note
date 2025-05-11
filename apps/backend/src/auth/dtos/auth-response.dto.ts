import { ApiProperty } from "@nestjs/swagger";
import { User } from "../entities/user.entity";
import { UserResponseDto } from "./user-response.dto";

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  /**
   * User 엔티티로 AuthResponseDto를 생성합니다.
   * @param user User 엔티티
   * @returns AuthResponseDto 객체
   */
  static create(user: User): AuthResponseDto {
    const response = new AuthResponseDto();
    response.user = UserResponseDto.fromEntity(user);
    return response;
  }
}
