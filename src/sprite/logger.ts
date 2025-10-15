const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
} as const;

type ColorKey = keyof typeof colors;

export interface LoggerOptions {
  verbose?: boolean;
  prefix?: string;
}

export class Logger {
  private verbose: boolean;
  private prefix: string;

  constructor(options: LoggerOptions = {}) {
    this.verbose = options.verbose || false;
    this.prefix = options.prefix || '';
  }

  private colorize(text: string, color: ColorKey): string {
    return `${colors[color]}${text}${colors.reset}`;
  }

  private formatMessage(message: string): string {
    return this.prefix ? `${this.prefix}${message}` : message;
  }

  info(message: string): void {
    if (this.verbose) {
      console.log(this.colorize(this.formatMessage(message), 'cyan'));
    }
  }

  success(message: string): void {
    console.log(this.colorize(this.formatMessage(message), 'green'));
  }

  warn(message: string): void {
    console.warn(this.colorize(this.formatMessage(message), 'yellow'));
  }

  error(message: string): void {
    console.error(this.colorize(this.formatMessage(message), 'red'));
  }

  processing(message: string): void {
    if (this.verbose) {
      console.log(this.colorize(this.formatMessage(message), 'blue'));
    }
  }

  hash(message: string): void {
    if (this.verbose) {
      console.log(this.colorize(this.formatMessage(message), 'yellow'));
    }
  }

  file(message: string): void {
    if (this.verbose) {
      console.log(this.colorize(this.formatMessage(message), 'magenta'));
    }
  }

  output(message: string): void {
    console.log(this.colorize(this.formatMessage(message), 'cyan'));
  }

  stats(message: string): void {
    console.log(this.colorize(this.formatMessage(message), 'blue'));
  }

  size(message: string): void {
    console.log(this.colorize(this.formatMessage(message), 'yellow'));
  }

  log(message: string): void {
    if (this.verbose) {
      console.log(this.formatMessage(message));
    }
  }

  logAlways(message: string): void {
    console.log(this.formatMessage(message));
  }

  warnRaw(message: string): void {
    console.warn(this.formatMessage(message));
  }

  errorRaw(message: string): void {
    console.error(this.formatMessage(message));
  }

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  child(additionalPrefix: string): Logger {
    const newPrefix = this.prefix
      ? `${this.prefix}${additionalPrefix}`
      : additionalPrefix;
    return new Logger({ verbose: this.verbose, prefix: newPrefix });
  }
}

export const defaultLogger = new Logger({ verbose: true });

export function createLogger(options: LoggerOptions = {}): Logger {
  return new Logger(options);
}
