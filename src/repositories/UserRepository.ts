import {AppDataSource} from "../utils/database";
import {User} from "../models";
import {checksumAddress} from "viem";

export class UserRepository {
  private repository = AppDataSource.getRepository(User);

  async findByAddress(address: string): Promise<User | null> {
    return this.repository.findOneBy({address: checksumAddress(address as `0x${string}`)});
  }

  async create(address: string): Promise<User> {
    const user = new User();
    user.address = checksumAddress(address as `0x${string}`);
    return this.repository.save(user);
  }

  async findOrCreate(address: string): Promise<User> {
    const user = await this.findByAddress(address);
    if (user) {
      return user;
    }
    return this.create(address);
  }

  async updateRefreshToken(address: string, refreshToken: string | null): Promise<void> {
    await this.repository.update({address: checksumAddress(address as `0x${string}`)}, {refreshToken});
  }
} 