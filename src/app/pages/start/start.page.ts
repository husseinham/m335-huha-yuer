import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
} from "@ionic/angular/standalone";
import { HuntService } from '../../services/hunt.service';

@Component({
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    FormsModule,
    IonCard,
    IonCardContent,
  ],
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage {
  firstName = '';
  lastName = '';

  constructor(
    private alertController: AlertController,
    private router: Router,
    private hunt: HuntService
  ) {}

  async startGame() {
    const first = this.firstName.trim();
    const last = this.lastName.trim();

    if (!first || !last) {
      const alert = await this.alertController.create({
        header: 'Fehler',
        message: 'Bitte Vor- und Nachname eingeben.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    this.hunt.startHunt(first, last);

    this.router.navigateByUrl('/permissions');
  }
}
