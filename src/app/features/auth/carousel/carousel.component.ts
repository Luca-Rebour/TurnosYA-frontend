import { NgFor } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import Swiper from 'swiper';
import { Pagination, Autoplay } from 'swiper/modules';
import { LucideAngularModule, Calendar, AlarmClockCheck, Users } from 'lucide-angular';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [NgFor, LucideAngularModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent {
  readonly Calendar = Calendar;
  readonly AlarmClockCheck = AlarmClockCheck;
  readonly Users = Users;

  slides = [
    { title: 'Gestión simple', description: 'Easily create and manage your appointments.', icon: this.Calendar},
    { title: 'Clientes conectados', description: 'Your patients can book appointments online.', icon: this.Users },
    { title: 'Estadísticas claras', description: 'See your performance at a glance.', icon: this.AlarmClockCheck },
  ];
    ngAfterViewInit(): void {
    new Swiper('.swiper', {
      modules: [Pagination, Autoplay],
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      autoplay: {
        delay: 4000,
        disableOnInteraction: false
      },
    });
  }

}
