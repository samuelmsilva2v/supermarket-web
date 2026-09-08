import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { ErroCampoComponent } from '../../shared/erro-campo/erro-campo.component';

@Component({
  selector: 'app-edicao-categorias',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErroCampoComponent
  ],
  templateUrl: './edicao-categorias.component.html',
  styleUrl: './edicao-categorias.component.css'
})
export class EdicaoCategoriasComponent {

  id: string = '';
  erros: any = null;
  mensagem: string = '';
  erroGeral: string = '';

  constructor(
    private http: HttpClient,
    private activated: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.id = this.activated.snapshot.paramMap.get('id') as string;

    this.http.get(`${endpoints.categoria}/${this.id}`)
      .subscribe({
        next: (data: any) => {
          this.form.controls.nome.setValue(data.nome);
        }
      });
  }

  form = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.maxLength(100)])
  });

  mensagensNome = {
    required: 'O nome da categoria é obrigatório.',
    maxlength: 'O nome da categoria deve ter no máximo 100 caracteres.'
  };

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.http.put(`${endpoints.categoria}/${this.id}`, this.form.value)
      .subscribe({
        next: (data: any) => {
          this.erros = null;
          this.erroGeral = '';
          this.mensagem = `Categoria "${data.nome}" atualizada com sucesso.`;
        },
        error: (e) => {
          this.mensagem = '';
          if (typeof e.error === 'string') {
            this.erros = null;
            this.erroGeral = e.error;
          } else {
            this.erros = e.error;
            this.erroGeral = '';
          }
        }
      });
  }

  voltar() {
    this.router.navigate(['/pages/consulta-categorias']);
  }
}
