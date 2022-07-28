export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export class ConsoleLogger implements Logger {
  constructor(private name: string) { }

  info(message: string) {
    console.log(new Date(), `[${this.name}]`, message);
  }

  warn(message: string) {
    console.warn(new Date(), `[${this.name}]`, message);
  }

  error(message: string) {
    console.error(new Date(), `[${this.name}]`, message);
  }

}
