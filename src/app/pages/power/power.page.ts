import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Device } from '@capacitor/device';
import { HuntService } from '../../services/hunt.service';

@Component({
  standalone: true,
  selector: 'app-power',
  templateUrl: './power.page.html',
  styleUrls: ['./power.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class PowerPage implements OnInit, OnDestroy {
  isCharging = false;
  batteryLevel: number | null = null;
  private pollId?: any;

  constructor(public hunt: HuntService, private router: Router) {}

  ngOnInit() {
    this.hunt.startTask('power');
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private startPolling() {
    this.readBattery();
    this.pollId = setInterval(() => this.readBattery(), 1000);
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
    return `${Math.round(this.batteryLevel * 100)}%`;
  }

  get canComplete(): boolean {
    return this.isCharging;
  }

  async markDone() {
    if (!this.canComplete) return;

    this.hunt.completeTask('power');
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}

    this.router.navigateByUrl('/task-list');
  }

  skip() {
    this.hunt.skipTask('power');
    this.router.navigateByUrl('/task-list');
  }

  abort() {
    this.router.navigateByUrl('/task-list');
  }
}
