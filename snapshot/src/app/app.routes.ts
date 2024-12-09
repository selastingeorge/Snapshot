import { Routes } from "@angular/router";
import { HomeComponent } from "./views/home/home.component";
import { SettingsComponent } from "./views/settings/settings.component";
import { CaptureComponent } from "./views/capture/capture.component";
import { BookmarksComponent } from "./views/bookmarks/bookmarks.component";

export const routes: Routes = [
    {
        path:'',
        component:HomeComponent
    },
    {
        path:'capture',
        component:CaptureComponent
    },
    {
        path:'bookmarks',
        component:BookmarksComponent
    },
    {
        path:'settings',
        component:SettingsComponent
    }
];
