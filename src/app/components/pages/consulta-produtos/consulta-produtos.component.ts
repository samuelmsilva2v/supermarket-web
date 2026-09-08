import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { endpoints } from '../../../configurations/environment';
import { RouterLink } from '@angular/router';
import { corDaCategoria } from '../../../utils/categoria-cor';
import { abreviacaoUnidadeMedida, UNIDADES_MEDIDA } from '../../../utils/unidade-medida';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { PaginacaoComponent } from '../../shared/paginacao/paginacao.component';
import { FiltroChipsComponent, FiltroChip } from '../../shared/filtro-chips/filtro-chips.component';
import { PaginaResponse } from '../../../models/pagina-response.model';

@Component({
  selector: 'app-consulta-produtos',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmModalComponent,
    PaginacaoComponent,
    FiltroChipsComponent
  ],
  templateUrl: './consulta-produtos.component.html',
  styleUrl: './consulta-produtos.component.css'
})
export class ConsultaProdutosComponent {

  produtos: any[] = [];
  categorias: any[] = [];
  mensagem: string = '';
  erroExclusao: string = '';
  produtoIdParaExcluir: string | null = null;
  exibirConfirmacaoExclusao: boolean = false;
  mostrarMaisFiltros: boolean = false;

  pagina: number = 0;
  tamanho: number = 12;
  totalPaginas: number = 0;
  totalElementos: number = 0;

  // Exposto para uso no template (expressões de template só chamam membros do componente, não funções importadas soltas)
  corDaCategoria = corDaCategoria;
  abreviacaoUnidadeMedida = abreviacaoUnidadeMedida;
  unidadesMedida = UNIDADES_MEDIDA;

  constructor(private http: HttpClient) { }

  // Formulário de filtros: nome fica sempre visível, os demais ficam atrás de "Mais filtros"
  form = new FormGroup({
    nome: new FormControl(''),
    precoMin: new FormControl<number | null>(null),
    precoMax: new FormControl<number | null>(null),
    quantidadeMin: new FormControl<number | null>(null),
    quantidadeMax: new FormControl<number | null>(null),
    unidadeMedida: new FormControl(''),
    categoriaId: new FormControl('')
  });

  ngOnInit() {
    this.carregarProdutos();
    this.carregarCategorias();

    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe(() => {
        this.pagina = 0;
        this.carregarProdutos();
      });
  }

  carregarCategorias() {
    this.http.get<any[]>(endpoints.categoria)
      .subscribe({ next: (data) => this.categorias = data });
  }

  onSubmit() {
    this.pagina = 0;
    this.carregarProdutos();
  }

  toggleMaisFiltros() {
    this.mostrarMaisFiltros = !this.mostrarMaisFiltros;
  }

  carregarProdutos() {
    const v = this.form.value;

    let params = new HttpParams()
      .set('pagina', this.pagina)
      .set('tamanho', this.tamanho);

    params = this.comValor(params, 'nome', v.nome);
    params = this.comValor(params, 'precoMin', v.precoMin);
    params = this.comValor(params, 'precoMax', v.precoMax);
    params = this.comValor(params, 'quantidadeMin', v.quantidadeMin);
    params = this.comValor(params, 'quantidadeMax', v.quantidadeMax);
    params = this.comValor(params, 'unidadeMedida', v.unidadeMedida);
    params = this.comValor(params, 'categoriaId', v.categoriaId);

    this.http.get<PaginaResponse<any>>(endpoints.consultar_produtos, { params })
      .subscribe({
        next: (data) => {
          this.produtos = data.conteudo;
          this.totalPaginas = data.totalPaginas;
          this.totalElementos = data.totalElementos;
        }
      });
  }

  private comValor(params: HttpParams, chave: string, valor: string | number | null | undefined): HttpParams {
    return (valor !== null && valor !== undefined && valor !== '') ? params.set(chave, valor) : params;
  }

  get filtrosAtivos(): FiltroChip[] {
    const v = this.form.value;
    const chips: FiltroChip[] = [];

    if (v.nome) {
      chips.push({ chave: 'nome', rotulo: `Nome: "${v.nome}"` });
    }

    if (v.precoMin != null || v.precoMax != null) {
      chips.push({ chave: 'preco', rotulo: this.rotuloFaixa('Preço', v.precoMin, v.precoMax, 'R$ ') });
    }

    if (v.quantidadeMin != null || v.quantidadeMax != null) {
      chips.push({ chave: 'quantidade', rotulo: this.rotuloFaixa('Quantidade', v.quantidadeMin, v.quantidadeMax) });
    }

    if (v.unidadeMedida) {
      const unidade = this.unidadesMedida.find(u => u.valor === v.unidadeMedida);
      chips.push({ chave: 'unidadeMedida', rotulo: `Unidade: ${unidade?.rotulo ?? v.unidadeMedida}` });
    }

    if (v.categoriaId) {
      const categoria = this.categorias.find(c => c.id === v.categoriaId);
      chips.push({
        chave: 'categoriaId',
        rotulo: `Categoria: ${categoria?.nome ?? ''}`,
        cor: categoria ? corDaCategoria(categoria.nome) : undefined
      });
    }

    return chips;
  }

  private rotuloFaixa(nome: string, min: number | null | undefined, max: number | null | undefined, prefixo: string = ''): string {
    if (min != null && max != null) return `${nome}: ${prefixo}${min} – ${prefixo}${max}`;
    if (min != null) return `${nome}: a partir de ${prefixo}${min}`;
    return `${nome}: até ${prefixo}${max}`;
  }

  removerFiltro(chave: string) {
    switch (chave) {
      case 'nome': this.form.patchValue({ nome: '' }, { emitEvent: false }); break;
      case 'preco': this.form.patchValue({ precoMin: null, precoMax: null }, { emitEvent: false }); break;
      case 'quantidade': this.form.patchValue({ quantidadeMin: null, quantidadeMax: null }, { emitEvent: false }); break;
      case 'unidadeMedida': this.form.patchValue({ unidadeMedida: '' }, { emitEvent: false }); break;
      case 'categoriaId': this.form.patchValue({ categoriaId: '' }, { emitEvent: false }); break;
    }
    this.pagina = 0;
    this.carregarProdutos();
  }

  limparFiltros() {
    this.form.reset({
      nome: '', precoMin: null, precoMax: null, quantidadeMin: null, quantidadeMax: null,
      unidadeMedida: '', categoriaId: ''
    }, { emitEvent: false });
    this.pagina = 0;
    this.carregarProdutos();
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

  onDelete(id: string) {
    this.produtoIdParaExcluir = id;
    this.exibirConfirmacaoExclusao = true;
  }

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
