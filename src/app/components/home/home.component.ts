import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { LatMenuComponent } from '../lat-menu/lat-menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    LatMenuComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
