import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'access-jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([AtStrategy.fromCookies]),
      secretOrKey: configService.get<string>('JWT_PUBLIC'),
      ignoreExpiration: false,
    });
  }

  private static fromCookies(req: Request): string | null {
    if (req.cookies && typeof req.cookies === 'string') {
      const splitted = req.cookies.split(';');
      const at = splitted.find((el) =>
        el.trim().startsWith('__litee_snack_access_token'),
      );
      return at?.split('=')[1] || null;
    } else if (req.cookies && '__litee_snack_access_token' in req.cookies) {
      return req.cookies.__litee_snack_access_token;
    }
    return null;
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
