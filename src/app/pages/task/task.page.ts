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
  batteryLevel: number | null = null;
  private pollId?: any;

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
    this.readBattery();

    this.pollId = setInterval(() => {
      this.readBattery();
    }, 1000);
  }

  private stopPolling() {
    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = undefined;
    }
  }

  private async readBattery() {
    try {
      const info = await Device.getBatteryInfo();
      this.isCharging = !!info.isCharging;

      const level = (info as any).batteryLevel;
      this.batteryLevel = typeof level === 'number' ? level : null;
    } catch {
      this.isCharging = false;
      this.batteryLevel = null;
    }
  }

  get batteryPercentText(): string {
    if (this.batteryLevel === null) return '–%';
    const pct = Math.round(this.batteryLevel * 100);
    return `${pct}%`;
  }

  get canComplete(): boolean {
    if (this.key === 'power') return this.isCharging;
    return true;
  }

  async markDone() {
    if (!this.canComplete) return;

    this.hunt.completeTask(this.key);

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}

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
