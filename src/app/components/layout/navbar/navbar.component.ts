import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { ThemeService } from '../../../services/theme.service';
import { SessaoUsuarioService } from '../../../services/sessao-usuario.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    CommonModule,
    ConfirmModalComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  exibirConfirmacaoLogout: boolean = false;

  readonly isAuthenticated = computed(() => this.sessaoService.dados() !== null);
  readonly isAdmin = computed(() => this.sessaoService.dados()?.perfil === 'Administrador');
  readonly nome = computed(() => this.sessaoService.dados()?.nome ?? '');
  readonly email = computed(() => this.sessaoService.dados()?.email ?? '');
  readonly perfil = computed(() => this.sessaoService.dados()?.perfil ?? '');

  constructor(
    protected themeService: ThemeService,
    private sessaoService: SessaoUsuarioService
  ) { }

  logout() {
    this.exibirConfirmacaoLogout = true;
  }

  confirmarLogout() {
    this.exibirConfirmacaoLogout = false;
    this.sessaoService.limpar();
    location.href = '/pages/autenticar-usuario';
  }

  cancelarLogout() {
    this.exibirConfirmacaoLogout = false;
  }

}
