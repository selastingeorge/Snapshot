import { Injectable } from '@angular/core';
import Database from '@tauri-apps/plugin-sql';

@Injectable({
	providedIn: 'root'
})

export class DatabaseService {
	public database: Database|null = null;

	async initDatabase() {
		this.database = await Database.load('sqlite:database.db');
	}

	async getInstance() {
		if (!this.database) {
			await this.initDatabase();
		}
		return this.database;
	}
}
