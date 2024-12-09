import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
	message: string;
	type: 'success' | 'error' | 'info' | 'warning';
	duration?: number;
}

@Injectable({
	providedIn: 'root',
})

export class ToastService {
	private toastsSubject = new BehaviorSubject<Toast[]>([]);
	toasts$ = this.toastsSubject.asObservable();

	showToast(toast: Toast) {
		const toasts = [...this.toastsSubject.getValue(), toast];
		this.toastsSubject.next(toasts);
		setTimeout(() => this.removeToast(toast), toast.duration || 3000);
	}

	private removeToast(toast: Toast) {
		const toasts = this.toastsSubject.getValue().filter((t) => t !== toast);
		this.toastsSubject.next(toasts);
	}
}