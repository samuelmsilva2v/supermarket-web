import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { ErroCampoComponent } from '../../shared/erro-campo/erro-campo.component';

@Component({
  selector: 'app-edicao-usuarios',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErroCampoComponent
  ],
  templateUrl: './edicao-usuarios.component.html',
  styleUrl: './edicao-usuarios.component.css'
})
export class EdicaoUsuariosComponent {

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

    this.http.get(`${endpoints.usuario}/${this.id}`)
      .subscribe({
        next: (data: any) => {
          this.form.patchValue({
            nome: data.nome,
            sobrenome: data.sobrenome,
            username: data.username,
            email: data.email,
            perfil: data.perfil
          });
        }
      });
  }

  form = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]),
    sobrenome: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]),
    username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    perfil: new FormControl('Operador', [Validators.required])
  });

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

  mensagensPerfil = {
    required: 'Por favor, informe o perfil do usuário.'
  };

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.http.put(`${endpoints.usuario}/${this.id}`, this.form.value)
      .subscribe({
        next: (data: any) => {
          this.erros = null;
          this.erroGeral = '';
          this.mensagem = `Usuário ${data.nome} ${data.sobrenome} atualizado com sucesso.`;
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
    this.router.navigate(['/pages/consulta-usuarios']);
  }
}
