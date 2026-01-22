import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ActivatedRoute, Router } from '@angular/router';
import { HuntService, TaskKey } from '../../services/hunt.service';
import { Device } from '@capacitor/device';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

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
  }

  ngOnDestroy() {
    this.stopPolling();
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

        try {
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch {}
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
  get canComplete(): boolean {
    if (this.key === 'power') return this.isCharging;
    if (this.key === 'qr') return !!this.qrValue;
    return true;
  }

  // ---------- Buttons ----------
  async markDone() {
    if (!this.canComplete) return;

    this.hunt.completeTask(this.key);

    // haptisches Zeichen (Anforderung)
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {}

    // fertig? -> Ergebnis-Seite
    if (this.hunt.isFinished) {
      this.router.navigateByUrl('/finish');
      return;
    }

    // sonst zurück zur Liste
    this.router.navigateByUrl('/task-list');
  }

  skip() {
    this.hunt.skipTask(this.key);
    this.router.navigateByUrl('/task-list');
  }

  abort() {
    // Abbrechen -> zurück zur Startseite (wie du wolltest)
    this.router.navigateByUrl('/start');
  }
}
