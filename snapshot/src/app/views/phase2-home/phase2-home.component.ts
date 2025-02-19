import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardViewComponent } from '../../components/card-view/card-view.component';

@Component({
  selector: 'app-phase2-home',
  standalone: true,
  imports: [RouterModule, CardViewComponent],
  templateUrl: './phase2-home.component.html',
  styleUrl: './phase2-home.component.css'
})
export class Phase2HomeComponent {

}
