import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ActivatedRoute, Router } from '@angular/router';
import { HuntService, TaskKey } from '../../services/hunt.service';
import { Device } from '@capacitor/device';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Motion } from '@capacitor/motion';

@Component({
  standalone: true,
  selector: 'app-task',
  templateUrl: './task.page.html',
  styleUrls: ['./task.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class TaskPage implements OnInit, OnDestroy {
  key!: TaskKey;


  // POWER
  isCharging = false;
  batteryLevel: number | null = null;
  private pollId?: any;

  // QR
  qrValue: string | null = null;
  qrScanning = false;

  sensorReady = false;
  flipped180 = false;
  private motionHandle?: { remove: () => Promise<void> };

  gX = 0;
  gY = 0;
  gZ = 0;

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

    if (this.key === 'qr') {
      this.qrValue = this.hunt.getTask('qr').result ?? null;
    }

    if (this.key === 'sensor') {
      this.startMotion();
    }
  }

  ngOnDestroy() {
    this.stopPolling();
    this.stopMotion();
  }

  // ---------- POWER ----------
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

  // ---------- QR ----------
  async scanQr() {
    if (this.key !== 'qr') return;

    try {
      this.qrScanning = true;

      const perm = await BarcodeScanner.requestPermissions();
      if (perm.camera !== 'granted') return;

      const result = await BarcodeScanner.scan();
      const first = result.barcodes?.[0];

      if (first?.rawValue) {
        this.qrValue = first.rawValue;
        this.hunt.getTask('qr').result = first.rawValue;

        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
      }
    } catch {
      // scan abgebrochen oder fehlgeschlagen -> ignorieren
    } finally {
      this.qrScanning = false;
    }
  }

  clearQr() {
    this.qrValue = null;
    this.hunt.getTask('qr').result = undefined;
  }


  // ---------- UI-Logik ----------
  private async startMotion() {
    if (this.key !== 'sensor') return;

    try {
      this.motionHandle = await Motion.addListener('accel', (ev: any) => {
        const g = ev?.accelerationIncludingGravity;
        if (!g) return;

        const x = Number(g.x ?? 0);
        const y = Number(g.y ?? 0);
        const z = Number(g.z ?? 0);

        this.gX = x;
        this.gY = y;
        this.gZ = z;

        this.sensorReady = true;

        this.flipped180 = y < -7 && Math.abs(x) < 4;
      });
    } catch (e) {
      console.warn('Motion listener failed:', e);
      this.sensorReady = false;
      this.flipped180 = false;
    }
  }

  private async stopMotion() {
    try {
      await this.motionHandle?.remove();
    } catch {}
    this.motionHandle = undefined;
  }
  get canComplete(): boolean {
    if (this.key === 'power') return this.isCharging;
    if (this.key === 'qr') return !!this.qrValue;
    if (this.key === 'sensor') return this.flipped180;
    return true;
  }

 async markDone() {
  if (!this.canComplete) return;

  this.hunt.completeTask(this.key);

  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}

  if (this.hunt.isFinished) {
    this.router.navigateByUrl('/finish');
    return;
  }

  this.router.navigateByUrl('/task-list');
}


  skip() {
    this.hunt.skipTask(this.key);
    this.router.navigateByUrl('/task-list');
  }

  abort() {
  
    this.router.navigateByUrl('/start');
  }
}
