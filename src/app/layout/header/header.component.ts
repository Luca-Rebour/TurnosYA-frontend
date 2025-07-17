import { Component } from '@angular/core';
import { LucideAngularModule, User, Menu } from 'lucide-angular';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  readonly User = User;
  readonly Menu = Menu;
  @Output() toggleSidebar = new EventEmitter<void>();

    onMenuClick() {
    this.toggleSidebar.emit();
  }

}
