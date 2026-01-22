import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Geolocation, Position } from '@capacitor/geolocation';
import { HuntService } from '../../services/hunt.service';

@Component({
  standalone: true,
  selector: 'app-geo',
  templateUrl: './geo.page.html',
  styleUrls: ['./geo.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class GeoPage implements OnDestroy {
  // FIXES Ziel (dein gewünschter Standort)
  public targetLat = 47.0269592;
  public targetLng = 8.3009105;

  // Zielzone (Meter)
  public readonly radiusMeters = 10;

  distanceMeters: number | null = null;
  accuracyMeters: number | null = null;

  inZone = false;
  loading = true;

  private watchId: string | null = null;
  private pollTimer: any = null;

  constructor(public hunt: HuntService, private router: Router) {
    this.hunt.startTask('geo');
  }

  async ionViewWillEnter() {
    await this.startTracking();
  }

  ionViewWillLeave() {
    this.stopTracking();
  }

  ngOnDestroy() {
    this.stopTracking();
  }

  async startTracking() {
    this.loading = true;

    // Falls schon aktiv -> stoppen
    this.stopTracking();

    // 1) Sofort einmal Position holen
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 8000,
      });
      this.updateDistance(pos);
    } catch {
      // ignorieren, wir versuchen es weiter unten per watch/poll
    }

    // 2) Live Updates via watchPosition
    try {
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        },
        (pos, err) => {
          if (err || !pos) return;
          this.updateDistance(pos);
        }
      );
    } catch {
      this.watchId = null;
    }

    // 3) Zusätzlicher Poll (Android liefert manchmal zu selten watch-Updates)
    this.pollTimer = setInterval(async () => {
      try {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        });
        this.updateDistance(pos);
      } catch {}
    }, 1200);

    this.loading = false;
  }

  stopTracking() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private updateDistance(pos: Position) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    // Genauigkeit anzeigen (hilft beim Debugging auf Android)
    this.accuracyMeters = pos.coords.accuracy != null ? Math.round(pos.coords.accuracy) : null;

    const d = this.haversineMeters(lat, lng, this.targetLat, this.targetLng);

    // floor statt round -> weniger "steht fest"
    const shown = Math.max(0, Math.floor(d));

    if (shown <= this.radiusMeters) {
      this.distanceMeters = 0;
      this.inZone = true;

      // Aufgabe als erledigt markieren (nur einmal)
      if (!this.hunt.getTask('geo').done) {
        this.hunt.completeTask('geo');
      }
    } else {
      this.distanceMeters = shown;
      this.inZone = false;
    }
  }

  private haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const toRad = (x: number) => (x * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  weiter() {
    if (!this.inZone) return;
    this.router.navigateByUrl('/task-list');
  }

  ueberspringen() {
    this.hunt.skipTask('geo');
    this.router.navigateByUrl('/task-list');
  }

  abbrechen() {
    this.router.navigateByUrl('/leaderboard'); // später
  }
}
