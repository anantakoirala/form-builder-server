import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto } from './dto/singIn.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignUpDto) {
    const saltOrRounds = 10;
    const password = dto.password;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const emailInUse = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashedPassword },
    });

    return { success: true, user };
  }
  async signIn(dto: SignInDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException('Wrong credentials');
    }

    const matchPassword = await bcrypt.compare(dto.password, user.password);
    if (!matchPassword) {
      throw new BadRequestException('Wrong Credentials');
    }

    // Generate Tokens
    const token = await this.generateUserTokens(user.id);

    return {
      success: true,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    };
  }

  async generateUserTokens(userId: number) {
    console.log('port ananta token', typeof process.env.ACCESS_TOKEN_EXPIRY);
    // Retrieve expiry times from config and convert to numbers
    const accessTokenExpiry = Number(
      this.configService.get<string>('jwt.access_token_expiry') || '3600', // Default to 3600 seconds (1 hour)
    );
    const refreshTokenExpiry = Number(
      this.configService.get<string>('jwt.refresh_token_expiry') || '604800', // Default to 7 days in seconds
    );

    // Ensure that expiry values are valid numbers
    if (isNaN(accessTokenExpiry) || isNaN(refreshTokenExpiry)) {
      throw new Error('Invalid token expiry value');
    }

    // Generate Access Token with access token secret
    const accessToken = this.jwtService.sign(
      { userId },
      {
        expiresIn: accessTokenExpiry,
      },
    );

    // Generate Refresh Token with refresh token secret
    const refreshToken = this.jwtService.sign(
      { userId },
      {
        expiresIn: refreshTokenExpiry,
      },
    );

    // Store refresh token in database (or any other required storage)
    await this.storeRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(userId: number, token: string) {
    const expirySeconds = Number(process.env.REFRESH_TOKEN_EXPIRY) || 604800; // Default to 7 days in seconds
    const expiryDate = new Date(Date.now() + expirySeconds * 1000); // Convert seconds to milliseconds

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: expiryDate,
      },
    });
    return 'hello';
  }

  async vefiryUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: email },
      });
    } catch (error) {
      console.log('error');
    }
  }

  async getUser(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });
      if (!user) {
        throw new UnauthorizedException('unauthorized');
      }
      return user;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }
}
