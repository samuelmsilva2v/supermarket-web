import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { endpoints } from '../../../configurations/environment';
import { Chart, ChartModule } from 'angular-highcharts';
import { corDaCategoria } from '../../../utils/categoria-cor';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ChartModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  dados: any[] = [];
  grafico: Chart = new Chart();
  nomeUsuario: string = '';
  carregando: boolean = true;

  // Exposto para uso no template (expressões de template só chamam membros do componente, não funções importadas soltas)
  corDaCategoria = corDaCategoria;

  constructor(private http: HttpClient) { }

  get temEstoque(): boolean {
    return this.dados.some(item => item.qtdProdutos > 0);
  }

  ngOnInit() {

    const usuario = sessionStorage.getItem('usuario');
    if (usuario) {
      this.nomeUsuario = JSON.parse(usuario).nome;
    }

    this.http.get(endpoints.dashboard_categorias)
      .subscribe({
        next: (data) => {
          this.dados = data as any[];
          this.carregando = false;

          if (!this.temEstoque) {
            return;
          }

          const conteudo = this.dados.map(item => ({
            name: item.nomeCategoria,
            y: item.qtdProdutos,
            color: corDaCategoria(item.nomeCategoria)
          }));

          this.grafico = new Chart({
            chart: { type: 'pie', backgroundColor: 'transparent', style: { fontFamily: '"Work Sans", sans-serif' } },
            title: { text: 'Produtos por categoria', style: { fontFamily: '"Fraunces", serif', color: '#2B2621' } },
            subtitle: { text: 'Distribuição do estoque atual.' },
            plotOptions: {
              pie: {
                innerSize: '55%',
                borderWidth: 2,
                borderColor: '#F6F1E7',
                dataLabels: { enabled: true, style: { fontFamily: '"Work Sans", sans-serif', fontWeight: '500', textOutline: 'none' } }
              }
            },
            series: [{
              data: conteudo, type: 'pie',
              name: 'Categorias'
            }],
            legend: { enabled: false },
            credits: { enabled: false }
          });
        }
      })
  }
}
