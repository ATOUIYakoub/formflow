import { Controller, Post, Body, Res, Get, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 per minute
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body(new ValidationPipe()) dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { access_token } = await this.authService.register(dto.email, dto.password, dto.name);
    
    this.setCookie(res, access_token);
    return { message: 'Registered successfully' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 per minute
  @ApiOperation({ summary: 'Log in and receive a cookie' })
  async login(@Body(new ValidationPipe()) dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token } = await this.authService.login(dto.email, dto.password);
    
    this.setCookie(res, access_token);
    return { message: 'Logged in successfully' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out and clear the cookie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: isProd,
      expires: new Date(0),
      sameSite: isProd ? 'none' : 'lax',
    });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: Request) {
    return req.user;
  }

  private setCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: isProd ? 'none' : 'lax',
    });
  }
}
