import { Injectable } from '@angular/core';
import { DatabaseService } from '../database/database.service';

@Injectable({
	providedIn: 'root',
})
export class BookmarkService {
	constructor(private databaseService: DatabaseService) { }

	public async createBookmark(title: string, bookmarks: string[]) {
		try {
			const dbInstance = await this.databaseService.getInstance();
			await dbInstance?.execute(
				'INSERT INTO bookmarks (name, bookmarks) VALUES (?, ?)',
				[title, bookmarks.join(',')]
			);
		} catch (error) {
			console.error('Error creating bookmark:', error);
			throw error;
		}
	}

	public async updateBookmark(id: number, title: string, bookmarks: string[]) {
		try {
			const dbInstance = await this.databaseService.getInstance();
			await dbInstance?.execute(
				'UPDATE bookmarks SET name = ?, bookmarks = ? WHERE id = ?',
				[title, bookmarks.join(','), id]
			);
		} catch (error) {
			console.error('Error updating bookmark:', error);
			throw error;
		}
	}


	public async deleteBookmark(id: number) {
		try {
			const dbInstance = await this.databaseService.getInstance();
			await dbInstance?.execute('DELETE FROM bookmarks WHERE id = ?', [id]);
		} catch (error) {
			console.error('Error deleting bookmark:', error);
			throw error;
		}
	}

	public async fetchBookmarks() {
		try {
			const dbInstance = await this.databaseService.getInstance();
			const result:any = await dbInstance?.select('SELECT * FROM bookmarks');

			const formattedResult = result.map((bookmark: { id: number; name: string; bookmarks: string }) => ({
				...bookmark,
				bookmarks: bookmark.bookmarks ? bookmark.bookmarks.split(',') : [],
			}));

			return formattedResult;
		} catch (error) {
			console.error('Error fetching bookmarks:', error);
			throw error;
		}
	}
}
