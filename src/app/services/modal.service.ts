import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ModalComponent } from '../shared/modal/modal.component';

@Injectable({ providedIn: 'root' })

export class ModalService {
  private overlayRef: OverlayRef | null = null;
  private overlay = inject(Overlay);

open(component: any, title: string): void {
  if (this.overlayRef) return;

  this.overlayRef = this.overlay.create({
    hasBackdrop: true,
    backdropClass: 'cdk-overlay-dark-backdrop',
    positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
  });

  const portal = new ComponentPortal(ModalComponent);
  const modalRef = this.overlayRef.attach(portal).instance;

  modalRef.title = title;
  modalRef.contentComponent = component;

  this.overlayRef.backdropClick().subscribe(() => this.close());
}


  close(): void {
    this.overlayRef?.detach();
    this.overlayRef = null;
  }
}
