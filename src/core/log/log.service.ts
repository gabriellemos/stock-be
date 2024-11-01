import { Injectable } from '@nestjs/common';

@Injectable()
export class LogService {
  logInfo(message: string, object?: Record<string, unknown>) {
    // TODO: Implement logging
    console.log(message, object);
  }

  logWarn(message: string, object?: Record<string, unknown>) {
    // TODO: Implement logging
    console.warn(message, object);
  }

  logError(message: string, object?: Record<string, unknown>) {
    // TODO: Implement logging
    console.error(message, object);
  }
}
