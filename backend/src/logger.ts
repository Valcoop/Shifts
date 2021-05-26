import { Logger as NestLogger } from '@nestjs/common';

export interface LogMeta {
  absenceTypeID?: string | number;
  jobID?: string | number;
  slotID?: string | number;
  userID?: string | number;
  userSlotID?: string | number;
}

export class Logger extends NestLogger {
  private logMeta: LogMeta = {};

  constructor(context?: string, isTimestampEnabled = false) {
    super(context, isTimestampEnabled);
  }

  formatMessage(message: string, logMeta?: LogMeta) {
    return message + ' ' + JSON.stringify({ ...this.logMeta, ...logMeta });
  }

  setData(key: keyof LogMeta, value: string) {
    this.logMeta[key] = value;
  }

  error(message: string, context?: string): void;
  error(message: string, context?: string, logMeta?: LogMeta): void;
  error(message: string, context?: string, logMeta?: LogMeta) {
    super.error(this.formatMessage(message, logMeta), undefined, context);
  }

  log(message: string, context?: string): void;
  log(message: string, context?: string, logMeta?: LogMeta): void;
  log(message: string, context?: string, logMeta?: LogMeta) {
    super.log(this.formatMessage(message, logMeta), context);
  }

  warn(message: string, context?: string): void;
  warn(message: string, context?: string, logMeta?: LogMeta): void;
  warn(message: string, context?: string, logMeta?: LogMeta) {
    super.warn(this.formatMessage(message, logMeta), context);
  }
}
