import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  constructor(private http: HttpClient) {}
  huntStartedAt?: number;
  huntFinishedAt?: number;

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
    this.huntFinishedAt = undefined;

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

  submitRunToGoogleForm(run: HuntRun) {
  const url =
    'https://docs.google.com/forms/u/0/d/e/1FAIpQLSc9v68rbCckYwcIekRLOaVZ0Qdm3eeh1xCEkgpn3d7pParfLQ/formResponse';

  const hours = Math.floor(run.durationSeconds / 3600);
  const minutes = Math.floor((run.durationSeconds % 3600) / 60);
  const seconds = run.durationSeconds % 60;

  const body =
  `entry.1860183935=${encodeURIComponent(run.name)}` +
  `&entry.564282981=${encodeURIComponent(String(run.schnitzel))}` +
  `&entry.1079317865=${encodeURIComponent(String(run.kartoffeln))}` +
  `&entry.985590604=${encodeURIComponent(`${hours}:${minutes}:${seconds}`)}`;


  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  return this.http.post(url, body, { headers }).subscribe({
    next: () => console.log('Ergebnis an Google Forms gesendet'),
    error: err => console.warn('Google Form Fehler:', err)
  });
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

    const end = this.huntFinishedAt ?? Date.now();
    const seconds = Math.floor((end - this.huntStartedAt) / 1000);

    return Math.max(1, seconds);
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
  
  if (!this.huntStartedAt) this.huntStartedAt = Date.now();

  const t = this.getTask(key);
  if (!t.startedAt) t.startedAt = Date.now();
}

  completeTask(key: TaskKey): boolean {
    const t = this.getTask(key);
    if (t.done) return this.isFinished;

    const now = Date.now();
    t.finishedAt = now;
    t.done = true;
    t.skipped = false;

    const started = t.startedAt ?? now;
    const duration = now - started;
    t.potato = duration > this.potatoThresholdMs;

    if (this.isFinished && !this.huntFinishedAt) {
      this.huntFinishedAt = Date.now();
    }

    return this.isFinished;
  }

  skipTask(key: TaskKey) {
    const t = this.getTask(key);
    if (t.done) return;
    t.skipped = true;
  }

  get points(): number {
    return this.schnitzel * 10 + this.kartoffeln * 5;
  }

  createRun(): HuntRun {
  const rawName = `${this.firstName} ${this.lastName}`.trim();
  const name = rawName.length > 0 ? rawName : 'Unbekannt';

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
    this.huntFinishedAt = undefined;

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
}
