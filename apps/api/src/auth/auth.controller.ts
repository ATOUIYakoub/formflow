import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    // Note: Validation should ideally be done with a DTO and class-validator
    const { email, password, name } = body;
    const { access_token } = await this.authService.register(email, password, name);
    
    this.setCookie(res, access_token);
    return { message: 'Registered successfully' };
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in and receive a cookie' })
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { email, password } = body;
    const { access_token } = await this.authService.login(email, password);
    
    this.setCookie(res, access_token);
    return { message: 'Logged in successfully' };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out and clear the cookie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Expire immediately
    });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: Request) {
    // req.user is set by the JwtStrategy
    return req.user;
  }

  private setCookie(res: Response, token: string) {
    res.cookie('jwt', token, {
      httpOnly: true, // Prevents JS from reading the cookie
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in prod
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });
  }
}
