import { Injectable } from '@angular/core';
import { WebsocketService } from '../websocket/websocket.service';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class CaptureService {

	constructor(private socket: WebsocketService) { }

	public startCapturing(duration: number, delay: number, output_directory: string): void {
		console.log(`Capture Request Send with : duration:${duration}, interval:${delay},output directory:${output_directory}`)
		const request = {
			type: "request",
			id: "CAPTURE_SCREENSHOT",
			params: {
				duration: Number(duration),
				delay: Number(delay),
				output_directory: output_directory
			}
		};

		const request_string = JSON.stringify(request);
		console.log(request_string);
		this.socket.getSocketContext()?.send(request_string);
	}

	public stopCapturing(): void {
		const request = {
			type: "request",
			id: "STOP_CAPTURE",
		};

		const request_string = JSON.stringify(request);
		this.socket.getSocketContext()?.send(request_string);
	}
}
