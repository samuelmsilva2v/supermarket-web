import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { ErroCampoComponent } from '../../shared/erro-campo/erro-campo.component';

@Component({
  selector: 'app-cadastro-categorias',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErroCampoComponent
  ],
  templateUrl: './cadastro-categorias.component.html',
  styleUrl: './cadastro-categorias.component.css'
})
export class CadastroCategoriasComponent {

  erros: any = null;
  mensagem: string = '';
  erroGeral: string = '';

  constructor(private http: HttpClient, private router: Router) { }

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

    this.http.post(endpoints.categoria, this.form.value)
      .subscribe({
        next: (data: any) => {
          this.erros = null;
          this.erroGeral = '';
          this.mensagem = `Categoria "${data.nome}" cadastrada com sucesso.`;
          this.form.reset();
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
    this.router.navigate(['/pages/dashboard']);
  }
}
