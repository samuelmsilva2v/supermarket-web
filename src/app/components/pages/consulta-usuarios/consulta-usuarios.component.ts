import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RouterLink } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { PaginacaoComponent } from '../../shared/paginacao/paginacao.component';
import { FiltroChipsComponent, FiltroChip } from '../../shared/filtro-chips/filtro-chips.component';
import { PaginaResponse } from '../../../models/pagina-response.model';

@Component({
  selector: 'app-consulta-usuarios',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmModalComponent,
    PaginacaoComponent,
    FiltroChipsComponent
  ],
  templateUrl: './consulta-usuarios.component.html',
  styleUrl: './consulta-usuarios.component.css'
})
export class ConsultaUsuariosComponent {

  usuarios: any[] = [];
  mensagem: string = '';
  erroStatus: string = '';
  usuarioParaAlterarStatus: any | null = null;
  exibirConfirmacaoStatus: boolean = false;
  mostrarMaisFiltros: boolean = false;

  pagina: number = 0;
  tamanho: number = 12;
  totalPaginas: number = 0;
  totalElementos: number = 0;

  constructor(private http: HttpClient) { }

  // Formulário de filtros: nome fica sempre visível, os demais ficam atrás de "Mais filtros"
  form = new FormGroup({
    nome: new FormControl(''),
    username: new FormControl(''),
    ativo: new FormControl(''),
    perfil: new FormControl('')
  });

  ngOnInit() {
    this.carregarUsuarios();

    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe(() => {
        this.pagina = 0;
        this.carregarUsuarios();
      });
  }

  onSubmit() {
    this.pagina = 0;
    this.carregarUsuarios();
  }

  toggleMaisFiltros() {
    this.mostrarMaisFiltros = !this.mostrarMaisFiltros;
  }

  carregarUsuarios() {
    const v = this.form.value;

    let params = new HttpParams()
      .set('pagina', this.pagina)
      .set('tamanho', this.tamanho);

    params = this.comValor(params, 'nome', v.nome);
    params = this.comValor(params, 'username', v.username);
    params = this.comValor(params, 'ativo', v.ativo);
    params = this.comValor(params, 'perfil', v.perfil);

    this.http.get<PaginaResponse<any>>(endpoints.consultar_usuarios, { params })
      .subscribe({
        next: (data) => {
          this.usuarios = data.conteudo;
          this.totalPaginas = data.totalPaginas;
          this.totalElementos = data.totalElementos;
        }
      });
  }

  private comValor(params: HttpParams, chave: string, valor: string | null | undefined): HttpParams {
    return valor ? params.set(chave, valor) : params;
  }

  get filtrosAtivos(): FiltroChip[] {
    const v = this.form.value;
    const chips: FiltroChip[] = [];

    if (v.nome) {
      chips.push({ chave: 'nome', rotulo: `Nome: "${v.nome}"` });
    }

    if (v.username) {
      chips.push({ chave: 'username', rotulo: `Username: "${v.username}"` });
    }

    if (v.ativo) {
      chips.push({ chave: 'ativo', rotulo: v.ativo === 'true' ? 'Status: ativo' : 'Status: inativo' });
    }

    if (v.perfil) {
      chips.push({ chave: 'perfil', rotulo: `Perfil: ${v.perfil}` });
    }

    return chips;
  }

  removerFiltro(chave: string) {
    this.form.patchValue({ [chave]: '' }, { emitEvent: false });
    this.pagina = 0;
    this.carregarUsuarios();
  }

  limparFiltros() {
    this.form.reset({ username: '', nome: '', ativo: '', perfil: '' }, { emitEvent: false });
    this.pagina = 0;
    this.carregarUsuarios();
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

  onAlterarStatus(usuario: any) {
    this.usuarioParaAlterarStatus = usuario;
    this.exibirConfirmacaoStatus = true;
  }

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
