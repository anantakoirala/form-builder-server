import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/auth.dto'; // PascalCase DTO
import { ZodValidationPipe } from 'nestjs-zod';
import { Request, Response } from 'express';
import { SignInDto } from './dto/singIn.dto';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/getUser';

//@UsePipes(ZodValidationPipe)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  async signUp(@Body() signUpData: SignUpDto, @Res() res: Response) {
    try {
      const result = await this.authService.signup(signUpData);

      return res
        .status(HttpStatus.CREATED)
        .json({ success: true, message: 'User created successfully' });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }
  @Post('signin')
  async signIn(@Body() signInData: SignInDto, @Res() res: Response) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const result = await this.authService.signIn(signInData);
    const days_90 = 90 * 24 * 60 * 60 * 1000;
    const accessTokenExpiry = Number(
      this.configService.get<string>('jwt.access_token_expiry') || '3600', // Default to 3600 seconds (1 hour)
    );
    const refreshTokenExpiry = Number(
      this.configService.get<string>('jwt.refresh_token_expiry') || '604800', // Default to 7 days in seconds
    );

    // Convert access token expiry to milliseconds
    const accessTokenExpiryMs = accessTokenExpiry * 1000;
    const refreshTokenExpiryMs = refreshTokenExpiry * 1000;
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      path: '/',
      domain: isDevelopment ? 'localhost' : undefined, // Domain only for development
      secure: !isDevelopment, // Secure is true in production
      sameSite: isDevelopment ? 'lax' : 'none', // sameSite depends on environment
      expires: new Date(Date.now() + refreshTokenExpiryMs),
    });
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      path: '/',
      domain: isDevelopment ? 'localhost' : undefined, // Domain only for development
      secure: !isDevelopment, // Secure is true in production
      sameSite: isDevelopment ? 'lax' : 'none', // sameSite depends on environment
      expires: new Date(Date.now() + accessTokenExpiryMs),
    });
    return res.status(200).json({
      success: true,
      message: 'Login Successfully',
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getUser(
    @GetUser() user: { userId: number },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.getUser(user.userId);
    return res.status(200).json({ success: true, user: result });
  }

  @UseGuards(AuthGuard('refresh'))
  @Post('refresh-token')
  async generateRefreshToken(
    @GetUser() user: { userId: number },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const result = await this.authService.generateRefreshToken(user.userId);

    const accessTokenExpiry = Number(
      this.configService.get<string>('jwt.access_token_expiry') || '3600', // Default to 3600 seconds (1 hour)
    );
    const refreshTokenExpiry = Number(
      this.configService.get<string>('jwt.refresh_token_expiry') || '604800', // Default to 7 days in seconds
    );

    // Convert access token expiry to milliseconds
    const accessTokenExpiryMs = accessTokenExpiry * 1000;
    const refreshTokenExpiryMs = refreshTokenExpiry * 1000;
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      path: '/',
      domain: isDevelopment ? 'localhost' : undefined, // Domain only for development
      secure: !isDevelopment, // Secure is true in production
      sameSite: isDevelopment ? 'lax' : 'none', // sameSite depends on environment
      expires: new Date(Date.now() + refreshTokenExpiryMs),
    });
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      path: '/',
      domain: isDevelopment ? 'localhost' : undefined, // Domain only for development
      secure: !isDevelopment, // Secure is true in production
      sameSite: isDevelopment ? 'lax' : 'none', // sameSite depends on environment
      expires: new Date(Date.now() + accessTokenExpiryMs),
    });
    return res.status(200).json({
      success: true,
      message: 'Login Successfully',
      refreshToken: result.refreshToken,
      token: result.accessToken,
    });
  }
}
