import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresetService {

  private apiUrl = 'http://127.0.0.1:5102/';

  constructor(private http: HttpClient) { }

  savePreset(presetData: any): Observable<any> {
    return this.http.post(this.apiUrl+"presets", presetData);
  }

  public fetchPresets() {
    console.log(this.apiUrl + "presets");
    return this.http.get(this.apiUrl + "presets");
  }

  public getPreset(id: string) {
    const url = `${this.apiUrl}presets/${id}`;
    return this.http.get(url);
  }

  public updatePreset(id: string | null, presetData: any) {
    const url = `${this.apiUrl}presets/${id}`;
    const data = Object.fromEntries(presetData);

    ['x1', 'x2', 'y1', 'y2'].forEach(key => {
      if (data[key] !== undefined) data[key] = Number(data[key]);
    });

    return this.http.put(url, data);
  }

  public getPresetImageURL(preset: any | null) {
    return this.apiUrl + preset.image_url;
  }

  public deletePreset(id: string) {
    const url = `${this.apiUrl}presets/${id}`;
    return this.http.delete(url);
  }
}
