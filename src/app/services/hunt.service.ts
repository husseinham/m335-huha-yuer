import { Injectable } from '@angular/core';

export type TaskKey = 'geo' | 'qr' | 'sensor' | 'power';

export type TaskState = {
  key: TaskKey;
  title: string;
  subtitle: string;
  icon: string;
  done: boolean;
  skipped: boolean;
  startedAt?: number;
  finishedAt?: number;
  potato: boolean;
  result?: string;
};

export type HuntRun = {
  name: string;
  dateIso: string;
  durationSeconds: number;
  schnitzel: number;
  kartoffeln: number;
  points: number;
};

@Injectable({ providedIn: 'root' })
export class HuntService {
  private readonly potatoThresholdMs = 60_000;

  firstName = '';
  lastName = '';
  huntStartedAt?: number;

  tasks: TaskState[] = [
    { key: 'geo', title: 'Geolocation', subtitle: 'Erreiche das Ziel!', icon: 'location-outline', done: false, skipped: false, potato: false },
    { key: 'qr', title: 'QR-Code', subtitle: 'Scanne den Code', icon: 'qr-code-outline', done: false, skipped: false, potato: false },
    { key: 'sensor', title: 'Sensor', subtitle: 'Bewegung ausführen', icon: 'compass-outline', done: false, skipped: false, potato: false },
    { key: 'power', title: 'Strom', subtitle: 'Gerät verbinden', icon: 'battery-charging-outline', done: false, skipped: false, potato: false },
  ];

  startHunt(first: string, last: string) {
    this.firstName = first.trim();
    this.lastName = last.trim();
    this.huntStartedAt = Date.now();

    this.tasks = this.tasks.map(t => ({
      ...t,
      done: false,
      skipped: false,
      potato: false,
      startedAt: undefined,
      finishedAt: undefined,
      result: undefined,
    }));
  }

  get doneCount(): number {
    return this.tasks.filter(t => t.done).length;
  }

  get totalCount(): number {
    return this.tasks.length;
  }

  get schnitzel(): number {
    return this.doneCount;
  }

  get kartoffeln(): number {
    return this.tasks.filter(t => t.done && t.potato).length;
  }

  get progress(): number {
    return this.totalCount === 0 ? 0 : this.doneCount / this.totalCount;
  }

  get isFinished(): boolean {
  return this.doneCount === this.totalCount;
}

  get durationSeconds(): number {
    if (!this.huntStartedAt) return 0;
    return Math.max(0, Math.floor((Date.now() - this.huntStartedAt) / 1000));
  }

  formatDuration(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  getTask(key: TaskKey): TaskState {
    const t = this.tasks.find(x => x.key === key);
    if (!t) throw new Error('Task not found: ' + key);
    return t;
  }

  startTask(key: TaskKey) {
    const t = this.getTask(key);
    if (!t.startedAt) t.startedAt = Date.now();
  }

  completeTask(key: TaskKey) {
    const t = this.getTask(key);
    if (t.done) return;

    const now = Date.now();
    t.finishedAt = now;
    t.done = true;
    t.skipped = false;

    const started = t.startedAt ?? now;
    const duration = now - started;
    t.potato = duration > this.potatoThresholdMs;
  }

  skipTask(key: TaskKey) {
    const t = this.getTask(key);
    if (t.done) return;
    t.skipped = true;
  }

  createRun(): HuntRun {
  const name = `${this.firstName} ${this.lastName}`.trim();
  const durationSeconds = this.durationSeconds;
  const schnitzel = this.schnitzel;
  const kartoffeln = this.kartoffeln;

  const points = schnitzel * 10 + kartoffeln * 5;

  return {
    name,
    dateIso: new Date().toISOString(),
    durationSeconds,
    schnitzel,
    kartoffeln,
    points,
  };
}


  saveRun(run: HuntRun) {
    const key = 'hunts';
    const raw = localStorage.getItem(key);
    const arr: HuntRun[] = raw ? JSON.parse(raw) : [];
    arr.unshift(run);
    localStorage.setItem(key, JSON.stringify(arr));
  }

  reset() {
    this.firstName = '';
    this.lastName = '';
    this.huntStartedAt = undefined;

    this.tasks = this.tasks.map(t => ({
      ...t,
      done: false,
      skipped: false,
      potato: false,
      startedAt: undefined,
      finishedAt: undefined,
      result: undefined,
    }));
  }
  get points(): number {
  return this.schnitzel * 10 + this.kartoffeln * 5;
}


}
