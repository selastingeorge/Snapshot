import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PresetService } from '../../services/preset/preset.service';
import { ToastService } from '../../services/toast/toast.service';
import { ask } from '@tauri-apps/plugin-dialog';

@Component({
	selector: 'app-scan-region-presets',
	standalone: true,
	imports: [RouterModule],
	templateUrl: './scan-region-presets.component.html',
	styleUrl: './scan-region-presets.component.css'
})
export class ScanRegionPresetsComponent {
	public presets: any | null = [];

	constructor(public presetService: PresetService, public toastService:ToastService) {
		presetService.fetchPresets().subscribe({
			next: (data) => {
				this.presets = data;
			},
			error: () => {

			}
		})
	}

	getHostName(address: string): string {
		try {
			const url = new URL(address);
			const hostname = url.hostname;
			const domainParts = hostname.split('.');
			return domainParts.length > 2 ? domainParts[1] : domainParts[0];
		} catch (error) {
			console.error('Invalid URL:', address);
			return '';
		}
	}

	async deletePreset(id:string) {
		const allow = await ask('Delete the selected preset. This action cannot be reverted', {
			title: 'Delete Preset',
			kind: 'warning',
		});

		if(allow) {
			this.presetService.deletePreset(id).subscribe({
				next: () => {
					this.toastService.showToast({
						message: 'Preset Deleted Successfully',
						type: 'success',
					})
					this.presets = this.presets.filter((preset: any) => preset.id !== id);
				},
				error: (error) => {
					this.toastService.showToast({
						message: 'Error!, Unable to delete the preset',
						type: 'error',
					});
					console.error(error);
					
				}
			})
		}
	}

}
