import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class StStrategy extends PassportStrategy(Strategy, 'subscription-jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([StStrategy.fromCookies]),
      secretOrKey: configService.get<string>('JWT_PUBLIC'),
      ignoreExpiration: false,
    });
  }

  private static fromCookies(req: Request): string | null {
    if (req.cookies && typeof req.cookies === 'string') {
      const splitted = req.cookies.split(';');
      const st = splitted.find((el) =>
        el.trim().startsWith('__litee_snack_subscription_token'),
      );
      return st?.split('=')[1] || null;
    } else if (
      req.cookies &&
      '__litee_snack_subscription_token' in req.cookies
    ) {
      return req.cookies.__litee_snack_subscription_token;
    }
    return null;
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
