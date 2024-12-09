import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { WebsocketService } from './services/websocket/websocket.service';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { ToastService } from './services/toast/toast.service';
import { DatabaseService } from './services/database/database.service';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet, ToastContainerComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.css'
})

export class AppComponent {
	public status:string = "Offline";
	constructor(private socket:WebsocketService, private databaseService:DatabaseService)
	{
		this.socket.status$.subscribe((status) => {
			this.status = status;
		});
	}
}