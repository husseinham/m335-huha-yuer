import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './permissions.page.html',
  styleUrls: ['./permissions.page.scss'],
})
export class PermissionsPage {
  cameraStatus: string = 'unknown';
  locationStatus: string = 'unknown';

  canContinue = false;

  constructor(private navCtrl: NavController) {}

  async requestAllPermissions() {
    const cam = await Camera.requestPermissions({ permissions: ['camera'] });
    this.cameraStatus = cam.camera ?? 'unknown';

    const geo = await Geolocation.requestPermissions();
    this.locationStatus = geo.location ?? 'unknown';

    this.updateContinueState();
  }

  updateContinueState() {
    this.canContinue =
      this.cameraStatus === 'granted' &&
      this.locationStatus === 'granted';
  }

  continue() {
    this.navCtrl.navigateForward('/task-list');
  }

  back() {
    this.navCtrl.back();
  }
}
