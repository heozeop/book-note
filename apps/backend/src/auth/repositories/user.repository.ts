import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base.repository";
import { User } from "../entities/user.entity";

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(protected readonly em: EntityManager) {
    super(em, "User");
  }

  /**
   * 이메일로 사용자를 찾습니다.
   * @param email 찾을 사용자의 이메일
   * @returns 사용자 객체 또는 null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  /**
   * 여러 개의 사용자 ID로 사용자들을 찾습니다.
   * @param ids 사용자 ID 배열
   * @returns 사용자 객체 배열
   */
  async findByIds(ids: string[]): Promise<User[]> {
    return this.find({ id: { $in: ids } });
  }

  /**
   * 인증된 사용자인지 확인합니다.
   * @param id 사용자 ID
   * @returns 인증 여부
   */
  async isVerified(id: string): Promise<boolean> {
    const user = await this.findOne({ id });
    return user ? !!user.verifiedAt : false;
  }

  /**
   * 사용자 ID로 사용자를 찾습니다.
   * @param id 사용자 ID
   * @returns 사용자 객체 또는 null
   */
  async findById(id: string): Promise<User | null> {
    return this.findOne({ id });
  }

  /**
   * 모든 사용자를 찾습니다.
   * @returns 사용자 객체 배열
   */
  async getAllUsers(): Promise<User[]> {
    return this.find({});
  }

  /**
   * 사용자를 업데이트합니다 (nativeUpdate 사용).
   * @param id 사용자 ID
   * @param data 업데이트할 데이터
   * @returns 영향 받은 행 수
   */
  async updateUser(id: string, data: Partial<User>): Promise<number> {
    return this.nativeUpdate({ id }, data);
  }

  /**
   * 사용자를 삭제합니다 (nativeDelete 사용).
   * @param id 사용자 ID
   * @returns 영향 받은 행 수
   */
  async deleteUser(id: string): Promise<number> {
    return this.nativeDelete({ id });
  }

  /**
   * 사용자의 이메일을 검증합니다.
   * @param id 사용자 ID
   * @returns 영향 받은 행 수
   */
  async verifyEmail(id: string): Promise<number> {
    return this.nativeUpdate({ id }, { verifiedAt: new Date() });
  }
}
