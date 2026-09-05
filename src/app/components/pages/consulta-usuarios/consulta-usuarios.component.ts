import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RouterLink } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { PaginacaoComponent } from '../../shared/paginacao/paginacao.component';
import { PaginaResponse } from '../../../models/pagina-response.model';

@Component({
  selector: 'app-consulta-usuarios',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    PaginacaoComponent
  ],
  templateUrl: './consulta-usuarios.component.html',
  styleUrl: './consulta-usuarios.component.css'
})
export class ConsultaUsuariosComponent {

  // Atributos
  usuarios: any[] = [];

  // Estado da paginação
  pagina: number = 0;
  tamanho: number = 10;
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
}
