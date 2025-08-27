import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TaskService } from '../tasks.service';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, PanelModule, CardModule, DialogModule, RouterLink],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  columns: any[] = [];

  constructor(private taskService: TaskService, private router: Router) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (res) => {
        this.tasks = res;
        this.groupTasksByStatus();
      },
      error: (err) => {
        console.error('❌ Error al obtener tareas:', err);
        alert(err.error?.message || 'No se pudieron cargar las tareas');
      }
    });
  }

  groupTasksByStatus(): void {
    this.columns = [
      { title: 'Pendiente', status: 'pending', items: [] },
      { title: 'En Progreso', status: 'in_progress', items: [] },
      { title: 'Hecha', status: 'done', items: [] }
    ];

    for (const task of this.tasks) {
      const column = this.columns.find(col => col.status === task.status);
      if (column) column.items.push(task);
    }
  }

onDragStart(event: DragEvent, item: any, column: any) {
  const payload = { id: item.id, sourceStatus: column.status };
  const json = JSON.stringify(payload);
  event.dataTransfer?.setData('application/json', json);
  event.dataTransfer?.setData('text/plain', json); // fallback
  event.dataTransfer!.effectAllowed = 'move';
}

onDrop(targetColumn: any, event: DragEvent) {
  event.preventDefault();

  const data = event.dataTransfer?.getData('application/json') || event.dataTransfer?.getData('text/plain');
  if (!data) return;

  const { id, sourceStatus } = JSON.parse(data);
  if (!id || !sourceStatus || sourceStatus === targetColumn.status) return;

  const sourceColumn = this.columns.find(c => c.status === sourceStatus);
  if (!sourceColumn) return;

  const task = sourceColumn.items.find((t: any) => t.id === id);
  if (!task) return;

  // Mover optimistamente en UI
  sourceColumn.items = sourceColumn.items.filter((t: any) => t.id !== id);
  const previousStatus = task.status;
  task.status = targetColumn.status;
  targetColumn.items.push(task);

  // Persistir solo el cambio necesario
  this.taskService.updateTask(id, { status: task.status }).subscribe({
    next: () => {},
    error: () => {
      alert('Error al mover la tarea');
      // Revertir
      targetColumn.items = targetColumn.items.filter((t: any) => t.id !== id);
      task.status = previousStatus;
      sourceColumn.items.push(task);
    }
  });
}

  allowDrop(event: Event) {
    event.preventDefault();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  // dentro de la clase
showEdit = false;
editingTask: any | null = null;
editModel = { description: '', deadline: '' };

private toDateInputValue(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

openEdit(task: any): void {
  this.editingTask = task;
  this.editModel = {
    description: task.description || '',
    deadline: this.toDateInputValue(task.deadline)
  };
  this.showEdit = true;
}

closeEdit(): void {
  this.showEdit = false;
  this.editingTask = null;
}

saveEdit(): void {
  if (!this.editingTask) return;

  const payload = {
    description: this.editModel.description,
    deadline: this.editModel.deadline || null
  };

  this.taskService.updateTask(this.editingTask.id, payload).subscribe({
    next: (res: any) => {
      if (res && res.id) {
        Object.assign(this.editingTask, res);
      } else {
        this.editingTask.description = payload.description;
        this.editingTask.deadline = payload.deadline;
      }
      this.groupTasksByStatus();
      this.closeEdit();
    },
    error: (err) => {
      alert(err.error?.message || 'Error al actualizar la tarea');
      console.error(err);
    }
  });
}

  deleteTask(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          alert('Tarea eliminada');
          this.loadTasks();
        },
        error: (err) => {
          alert(err.error?.message || 'Error al eliminar tarea');
          console.error(err);
        }
      });
    }
  }

  addTask(): void {
    this.router.navigate(['/task/task-create']);
  }
}
