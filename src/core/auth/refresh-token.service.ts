import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { addDays, isAfter } from 'date-fns';

import {
  RefreshToken,
  RefreshTokenDocument,
} from './entity/refresh-token.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  findById(id: string) {
    return this.refreshTokenModel.findById(id);
  }

  deleteToken(id: string) {
    return this.refreshTokenModel.findByIdAndDelete(id);
  }

  async register(user: User) {
    if (!user) {
      throw new BadRequestException({ message: 'Invalid request' });
    }

    const refreshToken = await new this.refreshTokenModel({
      expriresAt: addDays(new Date(), 14),
      user,
    }).save();

    return refreshToken;
  }

  async isValid(id: string) {
    const refreshToken = await this.findById(id);
    const isValid = isAfter(refreshToken?.expriresAt, new Date());

    if (!isValid) {
      this.deleteToken(id);
    }

    return isValid;
  }
}
