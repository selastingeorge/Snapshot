import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-dialog',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './dialog.component.html',
	styleUrl: './dialog.component.css'
})
export class DialogComponent {
	isOpen = false;

	@Input() title:string="Sample";
	@Input() caption:string="Sample";
	@Output() dialogClose = new EventEmitter<void>();

	open(): void {
		this.isOpen = true;
	}

	close(): void {
		this.isOpen = false;
		this.dialogClose.emit();
	}
}
