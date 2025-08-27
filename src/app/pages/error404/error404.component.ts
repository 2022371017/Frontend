import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-error404',
  standalone: true,
  imports: [CardModule, ButtonModule, RouterModule],
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.css']
})
export class Error404Component {}
