import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-card-view',
  standalone: true,
  imports: [RouterLink, RouterModule],
  templateUrl: './card-view.component.html',
  styleUrl: './card-view.component.css'
})
export class CardViewComponent {
  @Input() title:string|null = null;
  @Input() caption:string|null = null;
  @Input() route:string|null = null;
  @Input() icon:any|null = null;
  @Output() click: EventEmitter<void> = new EventEmitter();

  public onCardClicked(e:MouseEvent)
  {
    this.click.emit();
  }
}
