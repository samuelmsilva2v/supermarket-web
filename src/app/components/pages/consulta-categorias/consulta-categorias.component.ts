import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RouterLink } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { corDaCategoria } from '../../../utils/categoria-cor';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { PaginacaoComponent } from '../../shared/paginacao/paginacao.component';
import { PaginaResponse } from '../../../models/pagina-response.model';

@Component({
  selector: 'app-consulta-categorias',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmModalComponent,
    PaginacaoComponent
  ],
  templateUrl: './consulta-categorias.component.html',
  styleUrl: './consulta-categorias.component.css'
})
export class ConsultaCategoriasComponent {

  // Atributos
  categorias: any[] = [];
  mensagem: string = '';
  erroExclusao: string = '';
  categoriaIdParaExcluir: string | null = null;
  exibirConfirmacaoExclusao: boolean = false;

  // Estado da paginação
  pagina: number = 0;
  tamanho: number = 12;
  totalPaginas: number = 0;
  totalElementos: number = 0;

  // Exposto para uso no template
  corDaCategoria = corDaCategoria;

  // Construtores
  constructor(private http: HttpClient) { }

  // Formulário para filtrar categorias por nome
  form = new FormGroup({
    nome: new FormControl('')
  });

  ngOnInit() {
    this.carregarCategorias();

    // Filtra automaticamente ao digitar; o botão de pesquisa força a busca na hora
    this.form.controls.nome.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pagina = 0;
        this.carregarCategorias();
      });
  }

  onSubmit() {
    this.pagina = 0;
    this.carregarCategorias();
  }

  // Busca a página atual de categorias, aplicando o filtro por nome se houver
  carregarCategorias() {
    const params = new HttpParams()
      .set('nome', this.form.value.nome ?? '')
      .set('pagina', this.pagina)
      .set('tamanho', this.tamanho);

    this.http.get<PaginaResponse<any>>(endpoints.consultar_categorias, { params })
      .subscribe({
        next: (data) => {
          this.categorias = data.conteudo;
          this.totalPaginas = data.totalPaginas;
          this.totalElementos = data.totalElementos;
        }
      });
  }

  onPaginaMudou(novaPagina: number) {
    this.pagina = novaPagina;
    this.carregarCategorias();
  }

  onTamanhoMudou(novoTamanho: number) {
    this.tamanho = novoTamanho;
    this.pagina = 0;
    this.carregarCategorias();
  }

  // Abre o modal de confirmação de exclusão de categoria
  onDelete(id: string) {
    this.categoriaIdParaExcluir = id;
    this.exibirConfirmacaoExclusao = true;
  }

  // Função para enviar a requisição de exclusão de categoria para a API
  confirmarExclusao() {
    this.exibirConfirmacaoExclusao = false;

    if (!this.categoriaIdParaExcluir) {
      return;
    }

    this.http.delete(`${endpoints.categoria}/${this.categoriaIdParaExcluir}`, { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.mensagem = data;
          this.erroExclusao = '';
          this.carregarCategorias();
        },
        error: (e) => {
          this.mensagem = '';
          this.erroExclusao = typeof e.error === 'string' ? e.error : 'Não foi possível excluir a categoria.';
        }
      });

    this.categoriaIdParaExcluir = null;
  }

  cancelarExclusao() {
    this.exibirConfirmacaoExclusao = false;
    this.categoriaIdParaExcluir = null;
  }
}
