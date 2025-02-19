import { Routes } from "@angular/router";
import { HomeComponent } from "./views/home/home.component";
import { SettingsComponent } from "./views/settings/settings.component";
import { CaptureComponent } from "./views/capture/capture.component";
import { BookmarksComponent } from "./views/bookmarks/bookmarks.component";
import { Phase2HomeComponent } from "./views/phase2-home/phase2-home.component";
import { ScanRegionPresetsComponent } from "./views/scan-region-presets/scan-region-presets.component";
import { CreatePresetComponent } from "./views/create-preset/create-preset.component";
import { ScannerComponent } from "./views/scanner/scanner/scanner.component";

export const routes: Routes = [
    {
        path:'',
        component:HomeComponent
    },
    {
        path:'home',
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
    },
    {
        path:'phase2',
        component:Phase2HomeComponent
    },
    {
        path:'scan-region-presets',
        component:ScanRegionPresetsComponent
    },
    {
        path:'create-preset',
        component:CreatePresetComponent
    },
    {
        path:'edit-preset/:id',
        component:CreatePresetComponent
    },
    {
        path:'scanner',
        component:ScannerComponent
    },
];
