import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { HuntService, HuntRun } from '../../services/hunt.service';

@Component({
  standalone: true,
  selector: 'app-finish',
  templateUrl: './finish.page.html',
  styleUrls: ['./finish.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class FinishPage {
  run!: HuntRun;
  private saved = false;

  private readonly START_ROUTE = '/start';

  constructor(public hunt: HuntService, private nav: NavController) {}

  ionViewWillEnter() {
    if (!this.saved) {
      this.run = this.hunt.createRun();
      this.hunt.saveRun(this.run);
      this.saved = true;
    } else {
      this.run = this.hunt.createRun();
    }
  }

  get durationLabel(): string {
    return this.hunt.formatDuration(this.hunt.durationSeconds);
  }

  newHunt() {
    this.hunt.reset();
    this.saved = false;
    this.nav.navigateRoot(this.START_ROUTE);
  }

  toLeaderboard() {
    this.nav.navigateRoot('/leaderboard');
  }
}

