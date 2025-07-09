import { Component, Input, ViewChild, ViewContainerRef, AfterViewInit, inject, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from 'app/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements AfterViewInit {
  @Input() title = 'Modal';
  @Input() contentComponent?: Type<any>; // componente a inyectar
  modalService = inject(ModalService);

  @ViewChild('contentHost', { read: ViewContainerRef }) contentHost!: ViewContainerRef;

  ngAfterViewInit() {
    if (this.contentComponent) {
      this.contentHost.clear();
      this.contentHost.createComponent(this.contentComponent);
    }
  }

  close() {
    this.modalService.close();
  }
}
