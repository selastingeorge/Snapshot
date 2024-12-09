import { Injectable } from '@angular/core';
import { Command } from '@tauri-apps/plugin-shell';

@Injectable({
	providedIn: 'root'
})
export class LauncherService {

	constructor() { }

	async launchChrome(url: string) {
		const command = Command.create('google-chrome',['--ozone-platform=wayland','--new-window',url]);
		try {
			const result = await command.execute();
			console.log(result);
		} catch (error) {
			console.error(error);
		}
	}

	async launchFiles(url: string) {
		const command = Command.create(`open`, [url]);

		try {
			const result = await command.execute();
			console.log(result);
		} catch (error) {
			console.error(error);
		}
	}
}
