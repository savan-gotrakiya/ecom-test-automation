// src/utils/profiler.ts

export class Profiler {
  private times: Record<string, [number, number]>;

  constructor() {
    this.times = {};
  }

  start(label: string): void {
    this.times[label] = process.hrtime();
  }

  end(label: string): string {
    const end = process.hrtime(this.times[label]);
    const duration = (end[0] * 1000 + end[1] / 1e6).toFixed(2);
    return `${duration}ms`;
  }
}
