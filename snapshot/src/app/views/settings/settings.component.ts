import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { open } from '@tauri-apps/plugin-dialog';
import { SettingsService } from '../../services/settings/settings.service';
import { Settings } from '../../interfaces/settings';
import { ToastService } from '../../services/toast/toast.service';
import { ask } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './settings.component.html',
	styleUrl: './settings.component.css'
})
export class SettingsComponent {

	public settings:Settings[] = [];
	public screenshotsDir:Settings|null = null;
	public screenshotsDuration:Settings|null = null;
	public screenshotsInterval:Settings|null = null;

	constructor(public settingsService:SettingsService, public toastService:ToastService)
	{
		this.fetchSettings();
	}

	public fetchSettings()
	{
		this.settingsService.fetchSettings().then((e)=>{
			this.settings = e;
			this.screenshotsDir = this.settings.find(item => item.key === 'SCREENSHOT_DIR') || null;
			this.screenshotsDuration = this.settings.find(item => item.key === 'DURATION') || null;
			this.screenshotsInterval = this.settings.find(item => item.key === 'INTERVAL') || null;
			console.log(this.screenshotsDir);
		})
	}

	public async onChangeDirectory() {
		const path = await open({
			directory: true
		});
		
		if(path!=null)
		{
			this.settingsService.updateSettings({
				key:"SCREENSHOT_DIR",
				value:path
			}).catch(()=>{
				this.toastService.showToast({
					message: 'Error!, Unable to update settings',
					type: 'error',
				})
			}).then(()=>{
				this.fetchSettings();
			})
		}
	}

	public onDurationChange(event: Event)
	{
		const duration = (event.target as HTMLSelectElement).value;
		this.settingsService.updateSettings({
			key:"DURATION",
			value:duration
		}).catch(()=>{
			this.toastService.showToast({
				message: 'Error!, Unable to update settings',
				type: 'error',
			})
		}).then(()=>{
			this.fetchSettings();
		})
	}

	public onIntervalChange(event: Event)
	{
		const interval = (event.target as HTMLSelectElement).value;
		this.settingsService.updateSettings({
			key:"INTERVAL",
			value:interval
		}).catch(()=>{
			this.toastService.showToast({
				message: 'Error!, Unable to update settings',
				type: 'error',
			})
		}).then(()=>{
			this.fetchSettings();
		})
	}


	public async onClearDataClicked(e:MouseEvent)
	{
		e.stopPropagation();
		const allow = await ask('Are you sure you want to delete all screenshots from the screenshots directory? This action cannot be undone.', {
			title: 'Delete Screenshots',
			kind: 'warning',
		});

		if (allow) {
			invoke('delete_screenshots', { directory: this.screenshotsDir?.value}).then(()=>{
				this.toastService.showToast({
					message: 'Screenshots cleared',
					type: 'success',
				})
			}).catch(()=>{
				this.toastService.showToast({
					message: 'Error!, Unable to delete the screenshots',
					type: 'error',
				})
			});
		}
	}
}
