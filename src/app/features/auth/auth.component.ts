import { Component } from '@angular/core';
import { SignInComponent } from './sign-in/sign-in.component';
import { NgIf } from '@angular/common';
import { CarouselComponent } from './carousel/carousel.component';
import { SignUpComponent } from "./sign-up/sign-up.component";
import { LucideAngularModule, Calendar } from 'lucide-angular';
import { LogoComponent } from '../../shared/components/logo/logo.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [SignInComponent, SignUpComponent, CarouselComponent, NgIf, LucideAngularModule, LogoComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
readonly Calendar = Calendar;
showLogIn: boolean = true;

}
