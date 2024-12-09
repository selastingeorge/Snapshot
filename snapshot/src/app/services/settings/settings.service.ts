import { Injectable } from '@angular/core';
import { DatabaseService } from '../database/database.service';
import { Settings } from '../../interfaces/settings';

@Injectable({
	providedIn: 'root'
})
export class SettingsService {

	constructor(private databaseService: DatabaseService) { }

	public async fetchSettings() {
		try {
			const dbInstance = await this.databaseService.getInstance();
			const result: any = await dbInstance?.select('SELECT * FROM settings');

			const formattedResult = result?.map((row: any) => ({
				key: row.key,
				value: row.value,
			}));

			return formattedResult;
		} catch (error) {
			console.error('Error fetching settings:', error);
			throw error;
		}
	}

	public async updateSettings(settings: Settings) {
		try {
			const dbInstance = await this.databaseService.getInstance();
			await dbInstance?.execute(
				'UPDATE settings SET value = ? WHERE key = ?',
				[settings.value, settings.key]
			);
		} catch (error) {
			console.error('Error unable to update settings:', error);
			throw error;
		}
	}
}
