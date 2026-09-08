import { Injectable, signal } from '@angular/core';

const CHAVE_ARMAZENAMENTO = 'usuario';

export interface UsuarioSessao {
  id: string;
  nome: string;
  username: string;
  email: string;
  perfil: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessaoUsuarioService {

  private readonly usuario = signal<UsuarioSessao | null>(this.lerArmazenamento());

  readonly dados = this.usuario.asReadonly();

  private lerArmazenamento(): UsuarioSessao | null {
    const bruto = sessionStorage.getItem(CHAVE_ARMAZENAMENTO);
    return bruto ? JSON.parse(bruto) : null;
  }

  // Mescla os campos editáveis no usuário da sessão e propaga a mudança (ex.: navbar) sem exigir reload
  atualizarDados(parcial: Partial<Pick<UsuarioSessao, 'nome' | 'email'>>): void {
    const atual = this.usuario();
    if (!atual) return;

    const atualizado = { ...atual, ...parcial };
    sessionStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(atualizado));
    this.usuario.set(atualizado);
  }

  limpar(): void {
    sessionStorage.removeItem(CHAVE_ARMAZENAMENTO);
    this.usuario.set(null);
  }
}
