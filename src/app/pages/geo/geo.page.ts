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
  // Unsere ZielKoordinaten
  public targetLat = 47.0269592;
  public targetLng =  8.3009105;



  // Radius 
 public readonly radiusMeters = 15;


  distanceMeters: number | null = null;
  inZone = false;
  loading = true;

  private watchId: string | null = null;

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

    
    this.stopTracking();

    // Einmalige Positionsabfrage
    try {
      const pos = await Geolocation.getCurrentPosition({
  enableHighAccuracy: true,
});
//this.targetLat = pos.coords.latitude - 0.00013;
//this.targetLng = pos.coords.longitude - 0.00013;

      this.updateDistance(pos);
    } catch {
      // falls es fehlschlägt
    }

    // Live-Tracking
    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (pos, err) => {
        if (err || !pos) return;
        this.updateDistance(pos);
      }
    );

    this.loading = false;
  }

  stopTracking() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }

  private updateDistance(pos: Position) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    const d = this.haversineMeters(lat, lng, this.targetLat, this.targetLng);
    const rounded = Math.max(0, Math.round(d));

    if (rounded <= this.radiusMeters) {
      this.distanceMeters = 0;
      this.inZone = true;

      // Aufgabe als erledigt markieren (nur einmal)
      if (!this.hunt.getTask('geo').done) {
        this.hunt.completeTask('geo');
      }
    } else {
      this.distanceMeters = rounded;
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
    this.router.navigateByUrl('/leaderboard'); 
  }
}
