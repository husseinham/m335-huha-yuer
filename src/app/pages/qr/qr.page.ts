import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { HuntService } from '../../services/hunt.service';

@Component({
  standalone: true,
  selector: 'app-qr',
  templateUrl: './qr.page.html',
  styleUrls: ['./qr.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class QrPage implements OnInit {
  private readonly EXPECTED_QR_CONTENT = 'nicht M335@ICT-BZ';

  qrValue: string | null = null;
  qrScanning = false;

  constructor(public hunt: HuntService, private router: Router) {}

  ngOnInit() {
    this.hunt.startTask('qr');
    const saved = this.hunt.getTask('qr').result ?? null;
    this.qrValue = saved;
  }

  get canComplete(): boolean {
    return (this.hunt.getTask('qr').result ?? '') === this.EXPECTED_QR_CONTENT;
  }

  get isWrongQr(): boolean {
    return !!this.qrValue && !this.canComplete;
  }

  async scanQr() {
    try {
      this.qrScanning = true;

      const perm = await BarcodeScanner.requestPermissions();
      if (perm.camera !== 'granted') return;

      const result = await BarcodeScanner.scan();
      const first = result.barcodes?.[0];
      if (!first?.rawValue) return;

      const value = first.rawValue.trim();
      this.qrValue = value;
      if (value === this.EXPECTED_QR_CONTENT) {
        this.hunt.getTask('qr').result = value;
        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
      } else {
        this.hunt.getTask('qr').result = undefined;
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
      }
    } catch (e) {
      console.warn('QR scan cancelled/failed:', e);
    } finally {
      this.qrScanning = false;
    }
  }

  clearQr() {
    this.qrValue = null;
    this.hunt.getTask('qr').result = undefined;
  }

  async markDone() {
    if (!this.canComplete) return;

    this.hunt.completeTask('qr');
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}

    this.router.navigateByUrl('/task-list');
  }

  skip() {
    this.hunt.skipTask('qr');
    this.router.navigateByUrl('/task-list');
  }

  abort() {
    this.router.navigateByUrl('/task-list');
  }
}
