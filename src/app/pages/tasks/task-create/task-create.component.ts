import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TaskService } from '../tasks.service';  
@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CalendarModule, DropdownModule],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.css']
})
export class TaskCreateComponent {
  description: string = '';
  deadline: string = '';
  status: string = '';
  priority: string = '';
  tags: string = '';
  notes: string = '';

  statusOptions = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'En Progreso', value: 'in_progress' },
    { label: 'Realizada', value: 'done' }
  ];

  constructor(private taskService: TaskService, private router: Router) {}

  createTask(): void {
    if (!this.description.trim()) {
      alert('La descripción es obligatoria');
      return;
    }

    const taskPayload = {
      description: this.description,
      deadline: this.deadline || null,
      status: this.status || 'pending',
      priority: this.priority,
      tags: this.tags,
      notes: this.notes,
      isalive: true
    };

    this.taskService.createTask(taskPayload).subscribe({
      next: () => {
        alert('Tarea creada con éxito');
        this.router.navigate(['/task/task-list']);
      },
      error: (err) => {
        console.error('Error al crear tarea', err);
        alert(err.error?.message || 'Error al crear tarea');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/task/task-list']);
  }

  // Métodos para la vista previa
  getPriorityLabel(priority: string): string {
    const priorities: { [key: string]: string } = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return priorities[priority] || priority;
  }

  getStatusLabel(status: string): string {
    const statuses: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in_progress': 'En progreso',
      'done': 'Completada'
    };
    return statuses[status] || status;
  }

  getTagsArray(): string[] {
    if (!this.tags) return [];
    return this.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }
}
