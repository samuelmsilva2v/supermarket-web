import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { ErroCampoComponent } from '../../shared/erro-campo/erro-campo.component';

@Component({
  selector: 'app-esqueci-senha',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ErroCampoComponent
  ],
  templateUrl: './esqueci-senha.component.html',
  styleUrl: './esqueci-senha.component.css'
})
export class EsqueciSenhaComponent {

  enviando: boolean = false;
  enviado: boolean = false;
  erroGeral: string = '';
  erros: any = null;

  constructor(private http: HttpClient) { }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  mensagensEmail = {
    required: 'Por favor, informe o seu e-mail.',
    email: 'Por favor, informe um endereço de e-mail válido.'
  };

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.erroGeral = '';
    this.erros = null;

    this.http.post(endpoints.esqueci_senha, this.form.value)
      .subscribe({
        next: () => {
          this.enviando = false;
          this.enviado = true;
        },
        error: (e) => {
          this.enviando = false;
          if (typeof e.error === 'string') {
            this.erroGeral = e.error;
          } else {
            this.erros = e.error;
          }
        }
      });
  }
}
