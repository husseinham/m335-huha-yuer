import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ActivatedRoute, Router } from '@angular/router';
import { HuntService, TaskKey } from '../../services/hunt.service';
import { Device } from '@capacitor/device';

@Component({
  standalone: true,
  selector: 'app-task',
  templateUrl: './task.page.html',
  styleUrls: ['./task.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class TaskPage implements OnInit, OnDestroy {
  key!: TaskKey;

  isCharging = false;
  private pollId?: any;
  private autoCompleted = false;

  constructor(
    public hunt: HuntService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key') as TaskKey;
    this.hunt.startTask(this.key);

    if (this.key === 'power') {
      this.startPolling();
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private startPolling() {
    this.pollId = setInterval(async () => {
      try {
        const info = await Device.getBatteryInfo();
        this.isCharging = !!info.isCharging;

        if (this.isCharging) {
          await this.autoCompletePowerTask();
        }
      } catch {
      }
    }, 1000);
  }

  private stopPolling() {
    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = undefined;
    }
  }

  private async autoCompletePowerTask() {
    if (this.autoCompleted) return;
    this.autoCompleted = true;

    this.stopPolling();
    this.hunt.completeTask('power');

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}

    this.router.navigateByUrl('/task-list');
  }

  async markDone() {
    if (this.key === 'power') return;

    this.hunt.completeTask(this.key);
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
    this.router.navigateByUrl('/task-list');
  }

  skip() {
    this.hunt.skipTask(this.key);
    this.router.navigateByUrl('/task-list');
  }

  abort() {
    this.router.navigateByUrl('/leaderboard');
  }
}
