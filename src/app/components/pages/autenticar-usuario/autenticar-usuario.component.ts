import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { ErroCampoComponent } from '../../shared/erro-campo/erro-campo.component';

@Component({
  selector: 'app-autenticar-usuario',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ErroCampoComponent
  ],
  templateUrl: './autenticar-usuario.component.html',
  styleUrl: './autenticar-usuario.component.css'
})
export class AutenticarUsuarioComponent {

  mensagem: string = '';
  erros: any = null;

  constructor(private http: HttpClient) { }

  form = new FormGroup({
    username : new FormControl('', [Validators.required]),
    senha : new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  mensagensUsername = {
    required: 'Por favor, informe o username de acesso.'
  };

  mensagensSenha = {
    required: 'Por favor, informe a senha de acesso.',
    minlength: 'Por favor, informe a senha de acesso com pelo menos 8 caracteres.'
  };

  onSubmit() {

    this.mensagem = '';
    this.erros = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.http.post(endpoints.autenticar_usuario, this.form.value)
      .subscribe({
        next: (data: any) => {
          sessionStorage.setItem('usuario', JSON.stringify(data));
          location.href = '/pages/dashboard';
        },
        error: (e) => {
          if(typeof e.error === "string") {              
            this.mensagem = e.error;
          }
          else {
            this.erros = e.error;              
          }
        }
      });
  }
}
