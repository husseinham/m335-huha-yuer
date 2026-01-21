import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ActivatedRoute, Router } from '@angular/router';
import { HuntService, TaskKey } from '../../services/hunt.service';

@Component({
  standalone: true,
  selector: 'app-task',
  templateUrl: './task.page.html',
  styleUrls: ['./task.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class TaskPage {
  key!: TaskKey;

  constructor(
    public hunt: HuntService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.key = this.route.snapshot.paramMap.get('key') as TaskKey;
    this.hunt.startTask(this.key);
  }

  async markDone() {
    this.hunt.completeTask(this.key);

    // Haptisches Zeichen bei Abschluss (Anforderung)
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}

    this.router.navigateByUrl('/task-list');
  }

  skip() {
    this.hunt.skipTask(this.key);
    this.router.navigateByUrl('/task-list');
  }

  abort() {
    this.router.navigateByUrl('/leaderboard'); // später
  }
}
