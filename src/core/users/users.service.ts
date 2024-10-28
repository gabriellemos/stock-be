import { Model, ObjectId } from 'mongoose';
import { randomUUID } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { addHours, isBefore } from 'date-fns';
import * as bcrypt from 'bcrypt';

import { SetPasswordInput } from './dto/set-password.input';
import { RegisterUserInput } from './dto/register-user.input';
import { UpdatePasswordInput } from './dto/update-password.input';
import { ForgotPasswordInput } from './dto/forgot-password.input';

import { User, UserDocument } from './entities/user.entity';
import { Secret, SecretDocument } from './entities/secret.entity';

import { MailService } from '../mail/mail.service';
import { LoggedUser } from '../auth/dto/logged-user';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Secret.name) private secretModel: Model<SecretDocument>,
    private mailService: MailService,
  ) {}

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email: { $eq: email } });
  }

  deleteSecret(id: ObjectId) {
    return this.secretModel.findByIdAndDelete(id);
  }

  async register(input: RegisterUserInput) {
    if (await this.findByEmail(input.email)) {
      throw new BadRequestException({ message: 'User already registered' });
    }

    const secret = await new this.secretModel({
      key: randomUUID(),
      expriresAt: addHours(new Date(), 1),
    }).save();

    const registeredUser = await new this.userModel({
      ...input,
      secret,
    }).save();

    // Send email with secret key
    const key = Buffer.from(
      `${registeredUser.id};${secret.key}`,
      'utf8',
    ).toString('base64');

    this.mailService.confirmSignUp(
      registeredUser.email,
      registeredUser.name,
      `${process.env.FRONTEND_URL}/set-password?key=${key}`,
    );
    return registeredUser;
  }

  async setPassword(input: SetPasswordInput) {
    const user = await this.userModel.findById(input.id).populate('secret');

    // User not found || Secret not found
    // Secret doesn't match || Secret expired
    if (
      !user ||
      !user.secret ||
      input.secret !== user.secret.key ||
      isBefore(user.secret.expriresAt, new Date())
    ) {
      if (user.secret) await this.deleteSecret(user.secret._id);
      throw new BadRequestException({ message: 'Invalid request' });
    } else if (user.secret) {
      await this.deleteSecret(user.secret._id);
    }

    const password = await bcrypt.hash(input.newPassword, 10);
    return this.userModel.findOneAndUpdate(
      { id: input.id },
      { password, secret: null },
      { new: true },
    );
  }

  async updatePassword(input: UpdatePasswordInput, loggedUser: LoggedUser) {
    const user = await this.userModel.findById(loggedUser.userID).lean();
    if (!user || !(await bcrypt.compare(input.oldPassword, user.password))) {
      throw new BadRequestException({ message: 'Invalid request' });
    }

    const newPassword = await bcrypt.hash(input.newPassword, 10);
    return this.userModel.findOneAndUpdate(
      { id: loggedUser.userID },
      { password: newPassword, secret: null },
      { new: true },
    );
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await this.userModel.findOne({ email: input.email });

    if (!user) {
      throw new BadRequestException({ message: 'Invalid request' });
    } else if (user.secret?._id) {
      await this.deleteSecret(user.secret._id);
    }

    const secret = await new this.secretModel({
      key: randomUUID(),
      expriresAt: addHours(new Date(), 1),
    }).save();

    const updatedUser = await this.userModel
      .findByIdAndUpdate(user._id, { secret: secret }, { new: true })
      .populate('secret');

    // Send email with secret key
    const key = Buffer.from(`${updatedUser.id};${secret.key}`, 'utf8').toString(
      'base64',
    );

    this.mailService.forgotPassword(
      updatedUser.email,
      updatedUser.name,
      `${process.env.FRONTEND_URL}/set-password?key=${key}`,
    );
    return updatedUser;
  }
}
