import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Motion } from '@capacitor/motion';
import { HuntService } from '../../services/hunt.service';

@Component({
  standalone: true,
  selector: 'app-sensor',
  templateUrl: './sensor.page.html',
  styleUrls: ['./sensor.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class SensorPage implements OnInit, OnDestroy {
  flipped180 = false;
  private motionHandle?: { remove: () => Promise<void> };

  constructor(public hunt: HuntService, private router: Router) {}

  ngOnInit() {
    this.hunt.startTask('sensor');
    this.startMotion();
  }

  ngOnDestroy() {
    this.stopMotion();
  }

  private async startMotion() {
    try {
      this.motionHandle = await Motion.addListener('accel', (ev: any) => {
        const g = ev?.accelerationIncludingGravity;
        if (!g) return;

        const x = Number(g.x ?? 0);
        const y = Number(g.y ?? 0);

        // sende doğru çalışan yön:
        this.flipped180 = y < -7 && Math.abs(x) < 4;
      });
    } catch (e) {
      console.warn('Motion listener failed:', e);
      this.flipped180 = false;
    }
  }

  private async stopMotion() {
    try { await this.motionHandle?.remove(); } catch {}
    this.motionHandle = undefined;
  }

  get canComplete(): boolean {
    return this.flipped180;
  }

  async markDone() {
    if (!this.canComplete) return;

    this.hunt.completeTask('sensor');
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}

    this.router.navigateByUrl('/task-list');
  }

  skip() {
    this.hunt.skipTask('sensor');
    this.router.navigateByUrl('/task-list');
  }

  abort() {
    this.router.navigateByUrl('/leaderboard');
  }
}
