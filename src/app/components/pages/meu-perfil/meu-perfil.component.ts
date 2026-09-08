import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { endpoints } from '../../../configurations/environment';
import { SessaoUsuarioService } from '../../../services/sessao-usuario.service';
import { ErroCampoComponent } from '../../shared/erro-campo/erro-campo.component';

function novaSenhaConfirmadaValidator(grupo: AbstractControl): ValidationErrors | null {
  const novaSenha = grupo.get('novaSenha')?.value;
  const novaSenhaConfirmacao = grupo.get('novaSenhaConfirmacao')?.value;
  return novaSenhaConfirmacao && novaSenha !== novaSenhaConfirmacao ? { senhasDiferentes: true } : null;
}

@Component({
  selector: 'app-meu-perfil',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErroCampoComponent
  ],
  templateUrl: './meu-perfil.component.html',
  styleUrl: './meu-perfil.component.css'
})
export class MeuPerfilComponent {

  carregando: boolean = true;
  perfilAtual: any = null;

  mensagemSucessoDados: string = '';
  erroGeralDados: string = '';
  errosDados: any = null;

  mensagemSucessoSenha: string = '';
  erroGeralSenha: string = '';
  errosSenha: any = null;

  constructor(
    private http: HttpClient,
    private sessaoService: SessaoUsuarioService
  ) { }

  dadosForm = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]),
    sobrenome: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  senhaForm = new FormGroup({
    senhaAtual: new FormControl('', [Validators.required]),
    novaSenha: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{8,}$/)]),
    novaSenhaConfirmacao: new FormControl('', [Validators.required])
  }, { validators: novaSenhaConfirmadaValidator });

  mensagensNome = {
    required: 'Por favor, informe o seu nome.',
    minlength: 'O nome deve ter no mínimo 2 caracteres.'
  };

  mensagensSobrenome = {
    required: 'Por favor, informe o seu sobrenome.',
    minlength: 'O sobrenome deve ter no mínimo 2 caracteres.'
  };

  mensagensEmail = {
    required: 'Por favor, informe o seu e-mail.',
    email: 'Por favor, informe um endereço de e-mail válido.'
  };

  mensagensSenhaAtual = {
    required: 'Por favor, informe a sua senha atual.'
  };

  mensagensNovaSenha = {
    required: 'Por favor, informe a nova senha.',
    pattern: 'Informe a nova senha com letras minúsculas, maiúsculas, números, símbolos e pelo menos 8 caracteres.'
  };

  get iniciais(): string {
    const nome = this.perfilAtual?.nome?.charAt(0) ?? '';
    const sobrenome = this.perfilAtual?.sobrenome?.charAt(0) ?? '';
    return (nome + sobrenome).toUpperCase();
  }

  ngOnInit() {
    this.http.get(endpoints.meu_perfil)
      .subscribe({
        next: (data: any) => {
          this.perfilAtual = data;
          this.carregando = false;

          this.dadosForm.patchValue({
            nome: data.nome,
            sobrenome: data.sobrenome,
            email: data.email
          });
        }
      });
  }

  onSubmitDados() {
    this.mensagemSucessoDados = '';
    this.erroGeralDados = '';
    this.errosDados = null;

    if (this.dadosForm.invalid) {
      this.dadosForm.markAllAsTouched();
      return;
    }

    this.http.put(endpoints.meu_perfil, this.dadosForm.value)
      .subscribe({
        next: (data: any) => {
          this.perfilAtual = data;
          this.sessaoService.atualizarDados({ nome: data.nome, email: data.email });
          this.mensagemSucessoDados = 'Seus dados foram atualizados com sucesso.';
        },
        error: (e) => {
          if (typeof e.error === 'string') {
            this.erroGeralDados = e.error;
          } else {
            this.errosDados = e.error;
          }
        }
      });
  }

  onSubmitSenha() {
    this.mensagemSucessoSenha = '';
    this.erroGeralSenha = '';
    this.errosSenha = null;

    if (this.senhaForm.invalid) {
      this.senhaForm.markAllAsTouched();
      return;
    }

    const { senhaAtual, novaSenha } = this.senhaForm.value;

    this.http.put(endpoints.alterar_senha, { senhaAtual, novaSenha })
      .subscribe({
        next: () => {
          this.mensagemSucessoSenha = 'Senha alterada com sucesso.';
          this.senhaForm.reset();
        },
        error: (e) => {
          if (typeof e.error === 'string') {
            this.erroGeralSenha = e.error;
          } else {
            this.errosSenha = e.error;
          }
        }
      });
  }
}
