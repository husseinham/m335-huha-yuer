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
}
