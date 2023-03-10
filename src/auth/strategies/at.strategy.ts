import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getTokensFromRawHeaders } from '../../common/utils/getTokensFromRawHeaders';
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
    if (req.cookies && 'access_token' in req.cookies) {
      return req.cookies.access_token;
    } else if (req.rawHeaders.find((el) => el.startsWith('access_token'))) {
      const { at } = getTokensFromRawHeaders(req);
      return at;
    }
    return null;
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
