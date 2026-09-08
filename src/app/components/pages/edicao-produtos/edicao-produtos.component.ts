import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { corDaCategoria } from '../../../utils/categoria-cor';
import { UNIDADES_MEDIDA } from '../../../utils/unidade-medida';
import { ErroCampoComponent } from '../../shared/erro-campo/erro-campo.component';

@Component({
  selector: 'app-edicao-produtos',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErroCampoComponent
  ],
  templateUrl: './edicao-produtos.component.html',
  styleUrl: './edicao-produtos.component.css'
})
export class EdicaoProdutosComponent {

  id: string = '';
  categorias: any[] = [];
  erros: any = null;
  mensagem: string = '';
  erroGeral: string = '';
  corSelecionada: string = '';
  unidadesMedida = UNIDADES_MEDIDA;

  @ViewChild('precoInput') precoInput!: ElementRef<HTMLInputElement>;

  constructor(
    private http: HttpClient,
    private activated: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.id = this.activated.snapshot.paramMap.get('id') as string;

    this.http.get(`${endpoints.produto}/${this.id}`)
      .subscribe({
        next: (data: any) => {
          this.form.controls.nome.setValue(data.nome);
          this.form.controls.preco.setValue(data.preco);
          this.form.controls.quantidade.setValue(data.quantidade);
          this.form.controls.unidadeMedida.setValue(data.unidadeMedida);
          this.form.controls.categoriaId.setValue(data.categoria.id);
          this.corSelecionada = corDaCategoria(data.categoria.nome);
          this.formatarPreco(this.precoInput.nativeElement);
        }
      });

    this.http.get(endpoints.categoria)
      .subscribe({
        next: (data) => {
          this.categorias = data as any[];
        }
      });
  }

  form = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    preco: new FormControl('', [Validators.required, Validators.min(0.01)]),
    quantidade: new FormControl('', [Validators.required, Validators.min(0)]),
    unidadeMedida: new FormControl('', [Validators.required]),
    categoriaId: new FormControl('', [Validators.required])
  })

  mensagensNome = {
    required: 'O nome do produto é obrigatório.',
    maxlength: 'O nome do produto deve ter no máximo 100 caracteres'
  };

  mensagensPreco = {
    required: 'O preço do produto é obrigatório',
    min: 'O preço do produto deve ser maior que zero'
  };

  mensagensQuantidade = {
    required: 'A quantidade do produto é obrigatória',
    min: 'A quantidade do produto não pode ser negativa'
  };

  mensagensUnidadeMedida = {
    required: 'A unidade de medida do produto é obrigatória'
  };

  mensagensCategoria = {
    required: 'A categoria do produto é obrigatória'
  };

  onCategoriaChange() {
    const categoria = this.categorias.find(c => c.id === this.form.value.categoriaId);
    this.corSelecionada = categoria ? corDaCategoria(categoria.nome) : '';
  }

  onSubmit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.http.put(`${endpoints.produto}/${this.id}`, this.form.value)
      .subscribe({
        next: (data: any) => {
          this.erros = null;
          this.erroGeral = '';
          this.mensagem = `Produto "${data.nome}" atualizado com sucesso.`;
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
    this.router.navigate(['/pages/consulta-produtos']);
  }

  formatarPreco(input: HTMLInputElement) {
    const valor = parseFloat(input.value);

    if (!isNaN(valor)) {
      input.value = valor.toFixed(2);
    }
  }
}
