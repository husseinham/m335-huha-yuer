import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { HuntRun, HuntService } from '../../services/hunt.service';

@Component({
  standalone: true,
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class LeaderboardPage {
  runs: HuntRun[] = [];

  private readonly STORAGE_KEY = 'hunts';
  private readonly START_ROUTE = '/start';

  constructor(private nav: NavController, public hunt: HuntService) {}

  ionViewWillEnter() {
    this.loadRuns();
  }

  private isValidIsoDate(value: any): boolean {
    if (typeof value !== 'string' || value.trim().length === 0) return false;
    const d = new Date(value);
    return !Number.isNaN(d.getTime());
  }

  private isRealRun(r: any): r is HuntRun {
    const nameOk = typeof r?.name === 'string' && r.name.trim().length > 0;
    const dateOk = this.isValidIsoDate(r?.dateIso);
    const durationOk = typeof r?.durationSeconds === 'number' && r.durationSeconds > 0;
    const schnitzelOk = typeof r?.schnitzel === 'number' && r.schnitzel > 0;
    const pointsOk = typeof r?.points === 'number' && r.points > 0;

    return nameOk && dateOk && durationOk && schnitzelOk && pointsOk;
  }

  loadRuns() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const arr = Array.isArray(parsed) ? parsed : [];

    this.runs = arr.filter(r => this.isRealRun(r));

    this.runs.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime();
    });
  }

  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.runs = [];
  }

  newHunt() {
    this.hunt.reset();
    this.nav.navigateRoot(this.START_ROUTE);
  }

  formatDate(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  durationLabel(sec: number) {
    return this.hunt.formatDuration(sec);
  }
}
