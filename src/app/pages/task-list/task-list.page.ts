import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HuntService, TaskState } from '../../services/hunt.service';

@Component({
  standalone: true,
  selector: 'app-task-list',
  templateUrl: './task-list.page.html',
  styleUrls: ['./task-list.page.scss'],
  imports: [IonicModule, CommonModule],
})
export class TaskListPage {
  constructor(public hunt: HuntService, private router: Router) {}

  openTask(t: TaskState) {
    this.hunt.startTask(t.key);
    this.router.navigateByUrl(`/task/${t.key}`);
  }

  abortHunt() {
    this.router.navigateByUrl('/leaderboard'); // später
  }
}
