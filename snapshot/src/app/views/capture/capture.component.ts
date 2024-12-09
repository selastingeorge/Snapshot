import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoundProgressComponent } from 'angular-svg-round-progressbar';
import { ToastService } from '../../services/toast/toast.service';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { CaptureService } from '../../services/capture/capture.service';
import { Settings } from '../../interfaces/settings';
import { SettingsService } from '../../services/settings/settings.service';

@Component({
	selector: 'app-capture',
	standalone: true,
	imports: [CommonModule, RoundProgressComponent, RouterLink],
	templateUrl: './capture.component.html',
	styleUrl: './capture.component.css'
})
export class CaptureComponent {
	public captureProgress: number = 0;
	public isCapturing: boolean = false;
	
	public settings:Settings[] = [];
	public screenshotsDir:Settings|null = null;
	public screenshotsDuration:Settings|null = null;
	public screenshotsInterval:Settings|null = null;

	public captureCompleted: boolean = false;
	public captureStopped:boolean = false;
	public status:string="Ready";
	public progress:number = 0;
	public total:number = 0;


	constructor(private toastService: ToastService, private socket: WebsocketService, private captureService:CaptureService, private settingsService:SettingsService) {
		this.fetchSettings();
	}

	public fetchSettings()
	{
		this.settingsService.fetchSettings().then((e)=>{
			this.settings = e;
			this.screenshotsDir = this.settings.find(item => item.key === 'SCREENSHOT_DIR') || null;
			this.screenshotsDuration = this.settings.find(item => item.key === 'DURATION') || null;
			this.screenshotsInterval = this.settings.find(item => item.key === 'INTERVAL') || null;
		})
	}

	public onStartCapturing(): void {
		this.captureCompleted = false;
		this.captureStopped = false;
		if (this.socket.isConnected) {
			this.isCapturing = !this.isCapturing;
			if (this.isCapturing) {
				this.captureService.startCapturing(this.screenshotsDuration?.value,this.screenshotsInterval?.value,this.screenshotsDir?.value)
				this.socket.getResponse().subscribe((e)=>{
					console.log(e);
					if(e.id == "CAPTURE_PROGRESS")
					{
						this.status = "Capturing";
						this.captureProgress = ((e.message[0].elapsed_duration)/this.screenshotsDuration?.value)*100;
						this.progress = e.message[0].captured_screenshots;
						this.total = Math.floor((this.screenshotsDuration?.value/this.screenshotsInterval?.value));
					}
					else if(e.id=="STOP_CAPTURE")
					{
						this.captureStopped = true;
						this.status = "Stopped";
					}
					else if(e.id=="SAVE_PROGRESS")
					{
						this.status = "Saving";
						this.captureProgress = ((e.message[0].saved)/e.message[0].captured)*100;
						this.progress = e.message[0].saved;
						this.total =e.message[0].captured;
						if(e.message[0].saved == e.message[0].captured)
						{
							this.status = "Completed";
							this.captureCompleted = true;
							this.isCapturing = false;
						}
					}
					console.log(this.captureProgress);
				})
			} else {
				this.captureService.stopCapturing();

			}
		}
		else {
			this.toastService.showToast({
				message: 'Error!, Compositor is offline.',
				type: 'error',
			})
		}
	}
}