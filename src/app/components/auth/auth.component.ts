import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { LucideAngularModule, Calendar } from 'lucide-angular';
import { AuthService } from 'app/services/auth.service';
import { LoginRequest } from 'app/models/login-request.model';
import { RegisterRequest } from 'app/models/register-request.model';
import { AuthResponse } from 'app/models/auth-response.model';
import { Router } from '@angular/router';



@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    LucideAngularModule,
    ReactiveFormsModule
  ],  
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {

  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessageRegister: string = '';
  readonly calendarIcon = Calendar;
  mode: 'login' | 'signup' = 'login';
  errorMessage: string = '';
  constructor(private _authService: AuthService, private fb: FormBuilder, private router: Router) {

    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });

    this.registerForm = this.fb.group({
      name: [''],
      lastName: [''],
      phone: [''],
      email: [''],
      birthDate: [''],
      role: [''],
      password: [''],
      confirmPassword: ['']
    });

  }
 

  login() {
    console.log('Login form value', this.loginForm.value);
    this._authService.login(this.loginForm.value as LoginRequest).subscribe(
      (res: AuthResponse) => {
        console.log('Login successful', res);
        this.openDashboard();
      },
      (error) => {
        console.error('Login error', error);
        this.errorMessage = 'Invalid email or password';
      }
    );
  }

  signup() {
    console.log('Signup form value', this.registerForm.value);
    this._authService.register(this.registerForm.value as RegisterRequest).subscribe(
      (res: AuthResponse) => {
        console.log('Signup successful', res);
      },
      (error) => {
        console.error('Signup error', error);
        this.errorMessageRegister = 'Signup error';
      }
    );
    this.errorMessageRegister = 'Signup error';
  }

  openDashboard() {
    var role = this._authService.getUserRole();
    if (role === 'customer') {
      this.router.navigate(['/customer/dashboard']);
    } else if (role === 'professional') {
      this.router.navigate(['/professional/dashboard']);
    } else {
      this.errorMessage = 'Invalid role';
    }
  }
}
