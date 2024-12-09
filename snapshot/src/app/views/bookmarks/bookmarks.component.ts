import { Component, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DialogComponent } from "../../components/dialog/dialog.component";
import { BookmarkService } from '../../services/bookmark/bookmark.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast/toast.service';
import { LauncherService } from '../../services/launcher/launcher.service';
import { ask } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

@Component({
	selector: 'app-bookmarks',
	standalone: true,
	imports: [RouterLink, DialogComponent, FormsModule],
	templateUrl: './bookmarks.component.html',
	styleUrl: './bookmarks.component.css'
})
export class BookmarksComponent {
	@ViewChild(DialogComponent) bookmarkDialog!: DialogComponent;
	public bookmarkUrls: string | null = null;
	public bookmarkTitle: string | null = null;
	public currentBookmarkId: number | null = null;

	public bookmarks: any;

	constructor(public bookmarkService: BookmarkService, public toastService: ToastService, public launcherService: LauncherService) {
		this.fetchBookmarks();
	}

	fetchBookmarks(): void {
		this.bookmarkService.fetchBookmarks().then(item => {
			this.bookmarks = item;
			console.log(this.bookmarks);
		});
	}

	onDialogClose(): void {
		console.log('Dialog closed');
	}

	onBookmarkClicked(id: number): void {
		const bookmark = this.bookmarks.find((bookmark: any) => bookmark.id === id);
		this.bookmarkDialog.title = "Edit Bookmark";
		this.bookmarkTitle = bookmark.name;
		this.bookmarkUrls = bookmark.bookmarks.join(',');
		this.currentBookmarkId = bookmark.id;
		this.bookmarkDialog.open();
	}

	onCreateBookmarkClicked(): void {
		this.bookmarkDialog.title = "Create Bookmark";
		this.bookmarkTitle = null;
		this.bookmarkUrls = null;
		this.currentBookmarkId = null;
		this.bookmarkDialog.open();
	}

	onSaveClicked(): void {
		if (this.currentBookmarkId != null) {
			if (this.bookmarkTitle && this.bookmarkUrls) {
				this.bookmarkService.updateBookmark(this.currentBookmarkId, this.bookmarkTitle, this.bookmarkUrls.split(',')).then(() => {
					this.bookmarkDialog.close();
					this.fetchBookmarks();
					this.toastService.showToast({
						message: 'Bookmark has been updated',
						type: 'success',
					})
				}).catch(() => {
					this.toastService.showToast({
						message: 'Error!, Unable to update the bookmark',
						type: 'error',
					})
				});
			}
		}
		else {
			if (this.bookmarkTitle && this.bookmarkUrls) {
				this.bookmarkService.createBookmark(this.bookmarkTitle, this.bookmarkUrls.split(',')).then(() => {
					this.bookmarkDialog.close();
					this.fetchBookmarks();
					this.toastService.showToast({
						message: 'Bookmark has been added',
						type: 'success',
					})
				}).catch(() => {
					this.toastService.showToast({
						message: 'Error!, Unable to add new bookmark',
						type: 'error',
					})
				});
			}
		}
	}

	async onDeleteClicked(id: number, e: MouseEvent) {
		e.stopPropagation();
		const allow = await ask('Delete the selected bookmark. This action cannot be reverted', {
			title: 'Delete Bookmark',
			kind: 'warning',
		});

		if (allow) {
			this.bookmarkService.deleteBookmark(id).then(() => {
				this.toastService.showToast({
					message: 'Bookmark has been deleted',
					type: 'success',
				})
				this.fetchBookmarks();
			}).catch(() => {
				this.toastService.showToast({
					message: 'Error!, Unable to delete the bookmark',
					type: 'error',
				})
			})
		}
	}

	onLaunchClicked(id: number, e: MouseEvent) {
		e.stopPropagation();

		const bookmark = this.bookmarks.find((item: any) => item.id === id);
		if (!bookmark) {
			console.error(`Bookmark with id ${id} not found.`);
			return;
		}

		const urls: any[] = bookmark.bookmarks;
		invoke('launch_chrome', { urls:urls });
	}

}
