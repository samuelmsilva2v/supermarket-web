import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RouterLink } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { PaginacaoComponent } from '../../shared/paginacao/paginacao.component';
import { PaginaResponse } from '../../../models/pagina-response.model';

@Component({
  selector: 'app-consulta-usuarios',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmModalComponent,
    PaginacaoComponent
  ],
  templateUrl: './consulta-usuarios.component.html',
  styleUrl: './consulta-usuarios.component.css'
})
export class ConsultaUsuariosComponent {

  // Atributos
  usuarios: any[] = [];
  mensagem: string = '';
  erroStatus: string = '';
  usuarioParaAlterarStatus: any | null = null;
  exibirConfirmacaoStatus: boolean = false;

  // Estado da paginação
  pagina: number = 0;
  tamanho: number = 12;
  totalPaginas: number = 0;
  totalElementos: number = 0;

  // Construtores
  constructor(private http: HttpClient) { }

  // Formulário para filtrar usuários por username
  form = new FormGroup({
    username: new FormControl('')
  });

  ngOnInit() {
    this.carregarUsuarios();

    // Filtra automaticamente ao digitar; o botão de pesquisa força a busca na hora
    this.form.controls.username.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pagina = 0;
        this.carregarUsuarios();
      });
  }

  onSubmit() {
    this.pagina = 0;
    this.carregarUsuarios();
  }

  // Busca a página atual de usuários, aplicando o filtro por username se houver
  carregarUsuarios() {
    const params = new HttpParams()
      .set('username', this.form.value.username ?? '')
      .set('pagina', this.pagina)
      .set('tamanho', this.tamanho);

    this.http.get<PaginaResponse<any>>(endpoints.consultar_usuarios, { params })
      .subscribe({
        next: (data) => {
          this.usuarios = data.conteudo;
          this.totalPaginas = data.totalPaginas;
          this.totalElementos = data.totalElementos;
        }
      });
  }

  onPaginaMudou(novaPagina: number) {
    this.pagina = novaPagina;
    this.carregarUsuarios();
  }

  onTamanhoMudou(novoTamanho: number) {
    this.tamanho = novoTamanho;
    this.pagina = 0;
    this.carregarUsuarios();
  }

  get tituloConfirmacaoStatus(): string {
    return this.usuarioParaAlterarStatus?.ativo ? 'Inativar usuário' : 'Ativar usuário';
  }

  get mensagemConfirmacaoStatus(): string {
    const u = this.usuarioParaAlterarStatus;
    if (!u) {
      return '';
    }
    return u.ativo
      ? `Deseja realmente inativar o usuário ${u.nome} ${u.sobrenome}?`
      : `Deseja realmente ativar o usuário ${u.nome} ${u.sobrenome}?`;
  }

  // Abre o modal de confirmação de ativação/inativação de usuário
  onAlterarStatus(usuario: any) {
    this.usuarioParaAlterarStatus = usuario;
    this.exibirConfirmacaoStatus = true;
  }

  // Função para enviar a requisição de ativação/inativação de usuário para a API
  confirmarAlteracaoStatus() {
    this.exibirConfirmacaoStatus = false;

    const usuario = this.usuarioParaAlterarStatus;
    if (!usuario) {
      return;
    }

    const novoStatus = !usuario.ativo;

    this.http.patch(`${endpoints.usuario}/${usuario.id}/status`, { ativo: novoStatus })
      .subscribe({
        next: (data: any) => {
          this.mensagem = `Usuário ${data.nome} ${data.sobrenome} ${novoStatus ? 'ativado' : 'inativado'} com sucesso.`;
          this.erroStatus = '';
          usuario.ativo = data.ativo;
        },
        error: (e) => {
          this.mensagem = '';
          this.erroStatus = typeof e.error === 'string' ? e.error : 'Não foi possível atualizar o status do usuário.';
        }
      });

    this.usuarioParaAlterarStatus = null;
  }

  cancelarAlteracaoStatus() {
    this.exibirConfirmacaoStatus = false;
    this.usuarioParaAlterarStatus = null;
  }
}
