export class Profiler {
  constructor() {
    this.times = {};
  }

  start(label) {
    this.times[label] = process.hrtime();
  }

  end(label) {
    const end = process.hrtime(this.times[label]);
    const duration = (end[0] * 1000 + end[1] / 1e6).toFixed(2);
    return `${duration}ms`;
  }
}
