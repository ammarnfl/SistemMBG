import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const email =
      typeof req?.body?.email === 'string'
        ? req.body.email.toLowerCase().trim()
        : null;
    if (email) return Promise.resolve(`login-email:${email}`);
    return Promise.resolve(`login-ip:${req.ip}`);
  }
}
