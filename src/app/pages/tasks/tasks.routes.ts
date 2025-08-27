import { Routes } from '@angular/router';
import { TaskListComponent } from '../tasks/task-list/task-list.component';
import { TaskCreateComponent } from '../tasks/task-create/task-create.component';
import { authGuard } from '../../core/auth/auth.guard';

export const TASK_ROUTES: Routes = [
  { path: 'task-list', component: TaskListComponent, canActivate: [authGuard] },
  { path: 'task-create', component: TaskCreateComponent, canActivate: [authGuard] }
];
