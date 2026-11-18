export interface Clock {
  now(): Date;
}

export class RealClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class FixedClock implements Clock {
  private fixedTime: Date;
  constructor(isoString: string) {
    this.fixedTime = new Date(isoString);
  }
  now(): Date {
    return new Date(this.fixedTime);
  }
  advance(ms: number) {
    this.fixedTime = new Date(this.fixedTime.getTime() + ms);
  }
}
