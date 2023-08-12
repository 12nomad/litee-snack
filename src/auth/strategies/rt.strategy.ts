import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([RtStrategy.fromCookies]),
      secretOrKey: configService.get<string>('JWT_PUBLIC'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  private static fromCookies(req: Request): string | null {
    if (req.cookies && typeof req.cookies === 'string') {
      const splitted = req.cookies.split(';');
      const rt = splitted.find((el) =>
        el.trim().startsWith('__litee_snack_refresh_token'),
      );
      return rt?.split('=')[1] || null;
    } else if (req.cookies && '__litee_snack_refresh_token' in req.cookies) {
      return req.cookies.__litee_snack_refresh_token;
    }
    return null;
  }

  validate(req: Request, payload: JwtPayload) {
    const refresh_token = req.cookies?.__litee_snack_refresh_token;
    return {
      ...payload,
      refresh_token,
    };
  }
}
