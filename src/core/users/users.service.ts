import { Model, ObjectId } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { addHours, isBefore } from 'date-fns';
import * as bcrypt from 'bcrypt';

import { SetPasswordInput } from './dto/set-password.input';
import { RegisterUserInput } from './dto/register-user.input';
import { UpdatePasswordInput } from './dto/update-password.input';
import { ForgotPasswordInput } from './dto/forgot-password.input';

import { User } from './entities/user.entity';
import { Secret } from './entities/secret.entity';

import { MailService } from '../mail/mail.service';
import { LoggedUser } from '../auth/dto/logged-user';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Secret.name) private secretModel: Model<Secret>,
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
    // Check if email is already registered
    if (await this.findByEmail(input.email)) {
      throw new BadRequestException({ message: 'User already registered' });
    }

    // Generate secret (to set password)
    const secret = await new this.secretModel({
      expriresAt: addHours(new Date(), 1),
    }).save();

    // Register user with secret set
    const registeredUser = await new this.userModel({
      ...input,
      secret,
    }).save();

    // Encode information to send in email
    const key = Buffer.from(
      `${registeredUser.id};${secret.id}`,
      'utf8',
    ).toString('base64');

    // Send email with secret key
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
      input.secret !== user.secret.id ||
      isBefore(user.secret.expriresAt, new Date())
    ) {
      if (user.secret) {
        // Manually delete expired secret
        await this.deleteSecret(user.secret._id);
      }
      throw new BadRequestException({ message: 'Invalid request' });
    } else if (user.secret) {
      // Delete used secret
      await this.deleteSecret(user.secret._id);
    }

    // Hash password and update user
    const password = await bcrypt.hash(input.newPassword, 10);
    return this.userModel.findOneAndUpdate(
      { id: input.id },
      { password, secret: null },
      { new: true },
    );
  }

  async updatePassword(input: UpdatePasswordInput, loggedUser: LoggedUser) {
    const user = await this.userModel.findById(loggedUser.userID).lean();

    // Check if user exists and old password matches
    if (!user || !(await bcrypt.compare(input.oldPassword, user.password))) {
      throw new BadRequestException({ message: 'Invalid request' });
    }

    // Hash password and update user
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
      // Manually delete expired secret
      await this.deleteSecret(user.secret._id);
    }

    const secret = await new this.secretModel({
      expriresAt: addHours(new Date(), 1),
    }).save();

    const updatedUser = await this.userModel
      .findByIdAndUpdate(user._id, { secret: secret }, { new: true })
      .populate('secret');

    // Encode information to send in email
    const key = Buffer.from(`${updatedUser.id};${secret.id}`, 'utf8').toString(
      'base64',
    );

    // Send email with secret key
    this.mailService.forgotPassword(
      updatedUser.email,
      updatedUser.name,
      `${process.env.FRONTEND_URL}/set-password?key=${key}`,
    );
    return updatedUser;
  }
}
