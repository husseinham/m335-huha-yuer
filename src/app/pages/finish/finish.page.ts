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


  private readonly START_ROUTE = '/start'; 

  constructor(public hunt: HuntService, private nav: NavController) {}

  ionViewWillEnter() {
    this.run = this.hunt.createRun();
    this.hunt.saveRun(this.run);
  }
get durationLabel(): string {
  if (!this.run) return '00:00';
  return this.hunt.formatDuration(this.run.durationSeconds);
}

  newHunt() {
    this.hunt.reset();
    this.nav.navigateRoot(this.START_ROUTE);
  }

  toLeaderboard() {
    this.nav.navigateRoot('/leaderboard');
  }
}
