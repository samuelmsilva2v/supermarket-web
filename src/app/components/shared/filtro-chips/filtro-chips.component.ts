import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface FiltroChip {
  chave: string;
  rotulo: string;
  cor?: string;
}

@Component({
  selector: 'app-filtro-chips',
  imports: [
    CommonModule
  ],
  templateUrl: './filtro-chips.component.html',
  styleUrl: './filtro-chips.component.css'
})
export class FiltroChipsComponent {

  @Input() chips: FiltroChip[] = [];

  @Output() remover = new EventEmitter<string>();
  @Output() limparTudo = new EventEmitter<void>();
}
