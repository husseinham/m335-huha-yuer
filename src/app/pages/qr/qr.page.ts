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
  qrValue: string | null = null;
  qrScanning = false;

  constructor(public hunt: HuntService, private router: Router) {}

  ngOnInit() {
    this.hunt.startTask('qr');
    this.qrValue = this.hunt.getTask('qr').result ?? null;
  }

  get canComplete(): boolean {
    return !!this.qrValue;
  }

  async scanQr() {
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
