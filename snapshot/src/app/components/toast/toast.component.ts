import { Component, Input } from '@angular/core';
import { Toast } from '../../services/toast/toast.service';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-toast',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './toast.component.html',
	styleUrl: './toast.component.css'
})
export class ToastComponent {
	@Input() toast!: Toast;
	get toastClasses() {
		switch (this.toast.type) {
			case 'success':
				return 'bg-[#051b11] text-[#75b798] border border-[#0f5132]';
			case 'error':
				return 'bg-[#2c0b0e] text-[#ea868f] border border-[#842029]';
			case 'info':
				return 'bg-[#031633] text-[#6ea8fe] border border-[#084298]';
			case 'warning':
				return 'bg-[#332701] text-[#ffda6a] border border-[#997404]';
			default:
				return 'bg-[#161719] text-[#a7acb1] border border-[#41464b]';
		}
	}
}
