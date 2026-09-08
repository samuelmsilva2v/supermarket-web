import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { ErroCampoComponent } from '../../shared/erro-campo/erro-campo.component';

function senhasIguaisValidator(grupo: AbstractControl): ValidationErrors | null {
  const senha = grupo.get('senha')?.value;
  const senhaConfirmacao = grupo.get('senhaConfirmacao')?.value;
  return senhaConfirmacao && senha !== senhaConfirmacao ? { senhasDiferentes: true } : null;
}

@Component({
  selector: 'app-criar-usuario',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErroCampoComponent
  ],
  templateUrl: './criar-usuario.component.html',
  styleUrl: './criar-usuario.component.css'
})
export class CriarUsuarioComponent {

  mensagemSucesso: string = '';
  mensagemErro: string = '';
  erros: any = null;

  constructor(private http: HttpClient, private router: Router) { }

  form = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]),
    sobrenome: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]),
    username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    perfil: new FormControl('Operador', [Validators.required]),
    senha: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{8,}$/)]),
    senhaConfirmacao: new FormControl('', [Validators.required])
  }, { validators: senhasIguaisValidator });

  mensagensNome = {
    required: 'Por favor, informe o nome do usuário.',
    minlength: 'O nome deve ter no mínimo 2 caracteres.'
  };

  mensagensSobrenome = {
    required: 'Por favor, informe o sobrenome do usuário.',
    minlength: 'O sobrenome deve ter no mínimo 2 caracteres.'
  };

  mensagensUsername = {
    required: 'Por favor, informe o username do usuário.',
    minlength: 'O username deve ter no mínimo 3 caracteres.'
  };

  mensagensEmail = {
    required: 'Por favor, informe o e-mail do usuário.',
    email: 'Por favor, informe um endereço de e-mail válido.'
  };

  mensagensSenha = {
    required: 'Por favor, informe a senha do usuário.',
    pattern: 'Informe a senha com letras minúsculas, maiúsculas, números, símbolos e pelo menos 8 caracteres.'
  };

  mensagensPerfil = {
    required: 'Por favor, informe o perfil do usuário.'
  };

  onSubmit() {
    this.mensagemSucesso = '';
    this.mensagemErro = '';
    this.erros = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.http.post(endpoints.criar_usuario, this.form.value)
      .subscribe({
        next: (data: any) => {
          this.mensagemSucesso = `Usuário ${data.nome} ${data.sobrenome} cadastrado com sucesso.`
          this.form.reset({ perfil: 'Operador' });
        },
        error: (e) => {
          if(typeof e.error === "string") {
            this.mensagemErro = e.error;
          } else {
            this.erros = e.error;
          }
        }
      });
  }

  voltar() {
    this.router.navigate(['/pages/dashboard']);
  }
}
