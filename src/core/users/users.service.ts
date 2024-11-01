import { Model, ObjectId } from 'mongoose';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { addHours, isBefore } from 'date-fns';
import * as bcrypt from 'bcrypt';

import { LogService } from 'src/core/log/log.service';

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
    @Inject() private readonly logService: LogService,
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
      `${registeredUser._id};${secret._id}`,
      'utf8',
    ).toString('base64');

    // Send email with secret key
    this.mailService.confirmSignUp(
      registeredUser.email,
      registeredUser.name,
      `${process.env.FRONTEND_URL}/set-password?key=${key}`,
    );

    this.logService.logInfo('[RegisterUser] new user', { input });

    return registeredUser;
  }

  async setPassword(input: SetPasswordInput) {
    const user = await this.userModel.findById(input._id).populate('secret');

    if (!user) {
      throw new BadRequestException({ message: 'Invalid request' });
    } else if (!user.secret || input.secret !== user.secret._id.toString()) {
      this.logService.logWarn("[ResetPassword] someone else's token", {
        userId: user._id.toString(),
      });
      throw new BadRequestException({ message: 'Invalid request' });
    } else if (isBefore(user.secret.expriresAt, new Date())) {
      this.logService.logInfo('[ResetPassword] expired token', {
        userId: user._id.toString(),
      });
      throw new BadRequestException({ message: 'Invalid request' });
    }

    if (user.secret) {
      // Delete used secret
      await this.deleteSecret(user.secret._id);
    }

    // Hash password and update user
    const password = await bcrypt.hash(input.newPassword, 10);
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: input._id },
      { password, secret: null },
      { new: true },
    );

    this.logService.logInfo('[ResetPassword] password updated', {
      userId: user._id.toString(),
    });

    return updatedUser;
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
      { _id: loggedUser.userID },
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
    const key = Buffer.from(
      `${updatedUser._id};${secret._id}`,
      'utf8',
    ).toString('base64');

    // Send email with secret key
    this.mailService.forgotPassword(
      updatedUser.email,
      updatedUser.name,
      `${process.env.FRONTEND_URL}/set-password?key=${key}`,
    );

    this.logService.logInfo('[ForgotPassword] Password forgotten', {
      userId: user._id.toString(),
    });

    return updatedUser;
  }
}
