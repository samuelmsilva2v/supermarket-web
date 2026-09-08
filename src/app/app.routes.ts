import { Routes } from '@angular/router';
import { EdicaoProdutosComponent } from './components/pages/edicao-produtos/edicao-produtos.component';
import { ConsultaProdutosComponent } from './components/pages/consulta-produtos/consulta-produtos.component';
import { CadastroProdutosComponent } from './components/pages/cadastro-produtos/cadastro-produtos.component';
import { CadastroCategoriasComponent } from './components/pages/cadastro-categorias/cadastro-categorias.component';
import { ConsultaCategoriasComponent } from './components/pages/consulta-categorias/consulta-categorias.component';
import { EdicaoCategoriasComponent } from './components/pages/edicao-categorias/edicao-categorias.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { AutenticarUsuarioComponent } from './components/pages/autenticar-usuario/autenticar-usuario.component';
import { EsqueciSenhaComponent } from './components/pages/esqueci-senha/esqueci-senha.component';
import { CriarUsuarioComponent } from './components/pages/criar-usuario/criar-usuario.component';
import { ConsultaUsuariosComponent } from './components/pages/consulta-usuarios/consulta-usuarios.component';
import { EdicaoUsuariosComponent } from './components/pages/edicao-usuarios/edicao-usuarios.component';
import { MovimentacaoEstoqueComponent } from './components/pages/movimentacao-estoque/movimentacao-estoque.component';
import { MeuPerfilComponent } from './components/pages/meu-perfil/meu-perfil.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {
        path: 'pages/autenticar-usuario',
        component: AutenticarUsuarioComponent
    },
    {
        path: 'pages/esqueci-senha',
        component: EsqueciSenhaComponent
    },
    {
        path: 'pages/criar-usuario',
        component: CriarUsuarioComponent,
        canActivate: [AuthGuard, AdminGuard]
    },
    {
        path: 'pages/consulta-usuarios',
        component: ConsultaUsuariosComponent,
        canActivate: [AuthGuard, AdminGuard]
    },
    {
        path: 'pages/edicao-usuarios/:id',
        component: EdicaoUsuariosComponent,
        canActivate: [AuthGuard, AdminGuard]
    },
    {
        path: 'pages/dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pages/cadastro-produtos',
        component: CadastroProdutosComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pages/consulta-produtos',
        component: ConsultaProdutosComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pages/edicao-produtos/:id',
        component: EdicaoProdutosComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pages/cadastro-categorias',
        component: CadastroCategoriasComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pages/consulta-categorias',
        component: ConsultaCategoriasComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pages/edicao-categorias/:id',
        component: EdicaoCategoriasComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pages/movimentacao-estoque',
        component: MovimentacaoEstoqueComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pages/meu-perfil',
        component: MeuPerfilComponent,
        canActivate: [AuthGuard]
    },
    {
        path: '', pathMatch: 'full',
        redirectTo: 'pages/dashboard'
    }
];
