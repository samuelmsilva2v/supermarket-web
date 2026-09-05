import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { endpoints } from '../../../configurations/environment';
import { ErroCampoComponent } from '../../shared/erro-campo/erro-campo.component';
import { PaginacaoComponent } from '../../shared/paginacao/paginacao.component';
import { PaginaResponse } from '../../../models/pagina-response.model';

@Component({
  selector: 'app-movimentacao-estoque',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErroCampoComponent,
    PaginacaoComponent
  ],
  templateUrl: './movimentacao-estoque.component.html',
  styleUrl: './movimentacao-estoque.component.css'
})
export class MovimentacaoEstoqueComponent {

  produtos: any[] = [];
  produtoSelecionado: any = null;
  movimentacoes: any[] = [];
  private historicoRequisicaoId = 0;
  erros: any = null;
  mensagem: string = '';
  erroGeral: string = '';

  pagina: number = 0;
  tamanho: number = 10;
  totalPaginas: number = 0;
  totalElementos: number = 0;

  constructor(private http: HttpClient) { }

  form = new FormGroup({
    produtoId: new FormControl('', [Validators.required]),
    tipo: new FormControl('ENTRADA', [Validators.required]),
    quantidade: new FormControl('', [Validators.required, Validators.min(1)]),
    motivo: new FormControl('', [Validators.required, Validators.maxLength(255)])
  });

  mensagensProduto = {
    required: 'Selecione o produto.'
  };

  mensagensQuantidade = {
    required: 'A quantidade é obrigatória.',
    min: 'A quantidade deve ser maior que zero.'
  };

  mensagensMotivo = {
    required: 'Informe o motivo da movimentação.',
    maxlength: 'O motivo deve ter no máximo 255 caracteres.'
  };

  ngOnInit() {
    this.http.get<any[]>(endpoints.produto)
      .subscribe({
        next: (data) => {
          this.produtos = data;
        }
      });
  }

  onProdutoChange() {
    this.produtoSelecionado = this.produtos.find(p => p.id === this.form.value.produtoId) ?? null;
    this.pagina = 0;
    this.carregarHistorico();
  }

  carregarHistorico() {
    const produtoId = this.form.value.produtoId;

    if (!produtoId) {
      this.movimentacoes = [];
      this.totalPaginas = 0;
      this.totalElementos = 0;
      return;
    }

    const params = new HttpParams()
      .set('pagina', this.pagina)
      .set('tamanho', this.tamanho);

    // Descarta a resposta se o produto selecionado já tiver mudado (evita sobrescrever com uma resposta antiga fora de ordem)
    const requisicaoId = ++this.historicoRequisicaoId;

    this.http.get<PaginaResponse<any>>(`${endpoints.movimentacao_estoque}/produto/${produtoId}`, { params })
      .subscribe({
        next: (data) => {
          if (requisicaoId !== this.historicoRequisicaoId) {
            return;
          }
          this.movimentacoes = data.conteudo;
          this.totalPaginas = data.totalPaginas;
          this.totalElementos = data.totalElementos;
        }
      });
  }

  onPaginaMudou(novaPagina: number) {
    this.pagina = novaPagina;
    this.carregarHistorico();
  }

  onTamanhoMudou(novoTamanho: number) {
    this.tamanho = novoTamanho;
    this.pagina = 0;
    this.carregarHistorico();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.http.post(endpoints.movimentacao_estoque, this.form.value)
      .subscribe({
        next: (data: any) => {
          this.erros = null;
          this.erroGeral = '';
          this.mensagem = `Movimentação de ${data.quantidade} unidade(s) (${data.tipo === 'ENTRADA' ? 'entrada' : 'saída'}) registrada com sucesso.`;

          if (this.produtoSelecionado) {
            this.produtoSelecionado.quantidade = data.tipo === 'ENTRADA'
              ? this.produtoSelecionado.quantidade + data.quantidade
              : this.produtoSelecionado.quantidade - data.quantidade;
          }

          this.form.patchValue({ tipo: 'ENTRADA', quantidade: '', motivo: '' });
          this.pagina = 0;
          this.carregarHistorico();
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
}
