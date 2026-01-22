import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
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
  private readonly START_ROUTE = '/start'; // falls deine Startseite /home ist -> '/home'

  constructor(private nav: NavController, public hunt: HuntService) {}

  ionViewWillEnter() {
    this.loadRuns();
  }

  loadRuns() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    this.runs = raw ? JSON.parse(raw) : [];

    // Sicherheit: falls irgendwas kaputt gespeichert wurde
    if (!Array.isArray(this.runs)) this.runs = [];

    // Sortierung: höchste Punkte zuerst, dann neueste
    this.runs.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return (b.dateIso ?? '').localeCompare(a.dateIso ?? '');
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

  backHome() {
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
