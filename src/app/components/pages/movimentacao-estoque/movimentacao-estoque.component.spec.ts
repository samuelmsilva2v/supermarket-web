import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimentacaoEstoqueComponent } from './movimentacao-estoque.component';

describe('MovimentacaoEstoqueComponent', () => {
  let component: MovimentacaoEstoqueComponent;
  let fixture: ComponentFixture<MovimentacaoEstoqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovimentacaoEstoqueComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovimentacaoEstoqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
