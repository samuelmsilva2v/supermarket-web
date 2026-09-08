import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { endpoints } from '../../../configurations/environment';
import { RouterLink } from '@angular/router';
import { corDaCategoria } from '../../../utils/categoria-cor';
import { abreviacaoUnidadeMedida } from '../../../utils/unidade-medida';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { PaginacaoComponent } from '../../shared/paginacao/paginacao.component';
import { PaginaResponse } from '../../../models/pagina-response.model';

@Component({
  selector: 'app-consulta-produtos',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmModalComponent,
    PaginacaoComponent
  ],
  templateUrl: './consulta-produtos.component.html',
  styleUrl: './consulta-produtos.component.css'
})
export class ConsultaProdutosComponent {

  // Atributos
  produtos: any[] = [];
  mensagem: string = '';
  erroExclusao: string = '';
  produtoIdParaExcluir: string | null = null;
  exibirConfirmacaoExclusao: boolean = false;

  // Estado da paginação
  pagina: number = 0;
  tamanho: number = 12;
  totalPaginas: number = 0;
  totalElementos: number = 0;

  // Exposto para uso no template
  corDaCategoria = corDaCategoria;
  abreviacaoUnidadeMedida = abreviacaoUnidadeMedida;

  // Construtores
  constructor(private http: HttpClient) { }

  // Formulário para filtrar produtos por nome
  form = new FormGroup({
    nome: new FormControl('')
  });

  ngOnInit() {
    this.carregarProdutos();

    // Filtra automaticamente ao digitar; o botão de pesquisa força a busca na hora
    this.form.controls.nome.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pagina = 0;
        this.carregarProdutos();
      });
  }

  onSubmit() {
    this.pagina = 0;
    this.carregarProdutos();
  }

  // Busca a página atual de produtos, aplicando o filtro por nome se houver
  carregarProdutos() {
    const params = new HttpParams()
      .set('nome', this.form.value.nome ?? '')
      .set('pagina', this.pagina)
      .set('tamanho', this.tamanho);

    this.http.get<PaginaResponse<any>>(endpoints.consultar_produtos, { params })
      .subscribe({
        next: (data) => {
          this.produtos = data.conteudo;
          this.totalPaginas = data.totalPaginas;
          this.totalElementos = data.totalElementos;
        }
      });
  }

  onPaginaMudou(novaPagina: number) {
    this.pagina = novaPagina;
    this.carregarProdutos();
  }

  onTamanhoMudou(novoTamanho: number) {
    this.tamanho = novoTamanho;
    this.pagina = 0;
    this.carregarProdutos();
  }

  // Abre o modal de confirmação de exclusão de produto
  onDelete(id: string) {
    this.produtoIdParaExcluir = id;
    this.exibirConfirmacaoExclusao = true;
  }

  // Função para enviar a requisição de exclusão de produto para a API
  confirmarExclusao() {
    this.exibirConfirmacaoExclusao = false;

    if (!this.produtoIdParaExcluir) {
      return;
    }

    this.http.delete(`${endpoints.produto}/${this.produtoIdParaExcluir}`, { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.mensagem = data;
          this.erroExclusao = '';
          this.carregarProdutos();
        },
        error: (e) => {
          this.mensagem = '';
          this.erroExclusao = typeof e.error === 'string' ? e.error : 'Não foi possível excluir o produto.';
        }
      });

    this.produtoIdParaExcluir = null;
  }

  cancelarExclusao() {
    this.exibirConfirmacaoExclusao = false;
    this.produtoIdParaExcluir = null;
  }
}
