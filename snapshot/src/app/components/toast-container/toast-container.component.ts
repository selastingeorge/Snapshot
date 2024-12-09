import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from '../../services/toast/toast.service';
import { Observable } from 'rxjs';
import { ToastComponent } from '../toast/toast.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-toast-container',
	standalone: true,
	imports: [ToastComponent,CommonModule],
	templateUrl: './toast-container.component.html',
	styleUrl: './toast-container.component.css'
})

export class ToastContainerComponent implements OnInit {
	toasts$!: Observable<Toast[]>;
  
	constructor(private toastService: ToastService) {}
  
	ngOnInit() {
	  this.toasts$ = this.toastService.toasts$;
	}
  }