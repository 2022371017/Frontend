import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service'; // ajusta la ruta según estructura
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CardModule,
    RouterModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputGroupModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  showQr = false; // ← para controlar el modal
  qrCodeBase64: string | null = null; // ← NUEVA propiedad
  
  // Propiedades para validación en tiempo real
  hasMinLength = false;
  hasUppercase = false;
  hasNumber = false;
  hasSpecialChar = false;
  
  closeAndGoToLogin(): void {
    this.showQr = false;
    this.router.navigate(['/auth/login']);
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/
          ),
        ],
      ],
    });

    // Suscribirse a cambios en el campo password para validación en tiempo real
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordRequirements(value || '');
    });
  }

  private updatePasswordRequirements(password: string): void {
    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[!@#$%^&*]/.test(password);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;

    this.authService.register(this.registerForm.value).subscribe({
      next: (res: any) => {
        const qr = res?.otp_qr ?? res?.user?.otp_qr ?? null;
        this.qrCodeBase64 = qr;
        this.showQr = !!qr; // abre el modal si hay QR
        this.isLoading = false;
        console.log('showQr', this.showQr, 'qr len', this.qrCodeBase64?.length);
        alert(
          'Usuario registrado correctamente. Escanea el código con Google Authenticator.'
        );
        this.isLoading = false;
      },
      error: (err) => {
        alert(err.error?.error || '❌ Error al registrar');
        this.isLoading = false;
      },
    });
  }
}
