import { Component } from '@angular/core';
import { CardViewComponent } from '../../components/card-view/card-view.component';
import { LauncherService } from '../../services/launcher/launcher.service';
import { SettingsService } from '../../services/settings/settings.service';
import { Settings } from '../../interfaces/settings';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CardViewComponent, RouterModule],
	templateUrl: './home.component.html',
	styleUrl: './home.component.css',
	animations: [
		trigger('fadeInOut', [
		  	state('void', style({ opacity: 0 })),
		  	transition(':enter', [animate('100ms ease-in')]),
      		transition(':leave', [animate('100ms ease-out')]),
		]),
	],
})
export class HomeComponent {
	public drawerOpen:boolean = false;
	public settings:Settings[] = [];

	constructor(public launcherService:LauncherService,public settingsService:SettingsService)
	{
		this.settingsService.fetchSettings().then((data)=>{
			this.settings = data;
		})
	}

	public toggleDrawer()
	{
		this.drawerOpen = !this.drawerOpen;
	}

	public async launchChrome()
	{
		await this.launcherService.launchChrome("google","https://google.com");
	}

	public async onBrowseScreenshotsClicked() {
		const directory = this.settings.find(item => item.key === 'SCREENSHOT_DIR') || null;
		await this.launcherService.launchFiles(directory?.value);
	}
}
