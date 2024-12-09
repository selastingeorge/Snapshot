import { Injectable } from "@angular/core";
import { Observable, Observer } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class WebsocketService {
	private socket: WebSocket | null = null;
	public status$: Subject<string> = new Subject();
	private messageSubject: Subject<any> = new Subject();
	public isConnected:boolean = false;

	constructor() {
		this.connect();
	}

	public getSocketContext() {
		return this.socket;
	}

	private connect(): void {
		this.socket = new WebSocket('ws://127.0.0.1:8125');
		this.socket.onopen = () => {
			this.status$.next('Online');
			this.isConnected = true;
		};

		this.socket.onclose = () => {
			this.status$.next('Offline');
			this.isConnected = false;
			setTimeout(() => this.connect(), 5000);
		};

		this.socket.onerror = (error) => {
			this.status$.next('Offline');
		};

		this.socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				this.messageSubject.next(data);
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
			}
		};
	}

	public sendMessage(message: any): void {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(message));
		} else {
			console.error('WebSocket is not open. Unable to send message.');
		}
	}

	public getResponse(): Observable<any> {
		return this.messageSubject.asObservable();
	}
}
