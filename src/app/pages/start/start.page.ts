import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
   standalone: true,
  imports: [IonicModule, FormsModule],
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage {

  firstName = '';
  lastName = '';

  constructor(
    private alertController: AlertController,
    private router: Router
  ) {}

  async startGame() {
    if (!this.firstName || !this.lastName) {
      const alert = await this.alertController.create({
        header: 'Fehler',
        message: 'Bitte Vor- und Nachname eingeben.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // später: Name speichern (Service / Preferences)
    this.router.navigateByUrl('/permissions');
  }
}
