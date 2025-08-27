import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';


@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {
  constructor(private router: Router) {}
   logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}