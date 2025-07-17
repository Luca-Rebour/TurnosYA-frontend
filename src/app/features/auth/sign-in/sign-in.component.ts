import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {

    signinForm: FormGroup;
    errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private _authService: AuthService, private router: Router) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

 onSubmit() {
  if (this.signinForm.valid) {
    this._authService.signIn(this.signinForm.value).subscribe({
      next: (response) => {
        this.errorMessage = null;
        console.log('Sign-in successful:', response);
        if (response.role.toLowerCase() === 'professional') {
          this.router.navigate(['/professional/dashboard']);
        } else if (response.role.toLowerCase() === 'customer') {
          this.router.navigate(['/customer/dashboard']);
        }
        else {
          this.errorMessage = 'Access denied. You do not have permission to access this area.';
        }
        
      },
      error: (err: Error) => {
        this.errorMessage = err.message || null;
      }
    });
  }
}

}
