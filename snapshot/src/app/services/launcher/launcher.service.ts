import { Injectable } from '@angular/core';
import { Command } from '@tauri-apps/plugin-shell';

@Injectable({
	providedIn: 'root'
})
export class LauncherService {

	constructor() { }

	async launchChrome(name:string, url: string) {
		let script = `google-chrome --ozone-platform=wayland --window-name="${name}" --new-window ${url}`
		const command = Command.create('shell', ['-c',script]);

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
