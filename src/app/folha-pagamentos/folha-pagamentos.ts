import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { IFuncionario, PagamentosApi } from './services/pagamentos-api';
import { rxResource } from '@angular/core/rxjs-interop';

export interface IMessageLogs {
  message: string;
  status: 'success' | 'error' | 'loading';
}

@Component({
  selector: 'app-folha-pagamentos',
  imports: [],
  templateUrl: './folha-pagamentos.html',
  styleUrl: './folha-pagamentos.css',
})
export class FolhaPagamentos {
  private readonly _pagamentosApi = inject(PagamentosApi);

  consoleLogs = signal<IMessageLogs[]>([
    { message: 'Sistema pronto para iniciar.', status: 'success' },
  ]);
  processando = signal(false);

  ngOnInit() {
    this.addLog({ message: 'Carregando funcionários...', status: 'success' });
    this.addLog({ message: 'Sistema pronto para iniciar.', status: 'error' });
    this.addLog({ message: 'Sistema pronto para iniciar.', status: 'loading' });
  }

  funcionariosResource = rxResource({
    params: () => true,
    stream: () => this._pagamentosApi.getFuncionarios(),
  });

  funcionarios = linkedSignal(() => {
    const HAS_ERRO = !!this.funcionariosResource.error();

    if (HAS_ERRO || !this.funcionariosResource.hasValue()) {
      return [];
    }

    return this.funcionariosResource.value() ?? [];
  });

  mensagemErroGetFuncionarios = computed(() => {
    const HAS_ERRO = this.funcionariosResource.error();

    if (HAS_ERRO && HAS_ERRO.cause) {
      return HAS_ERRO.cause;
    }

    return 'Erro inesperado ao carregar funcionários.';
  });

  funcionariosSelecionados = computed(() => {
    if (this.funcionarios().length > 0) {
      return this.funcionarios().filter((funcionario) => funcionario.selecionado);
    }

    return [];
  });

  recarregarFuncionarios() {
    this.funcionariosResource.reload();
  }

  toggleSelecao(funcionarioId: number) {
    this.funcionarios.update((funcionarios) => {
      return funcionarios.map((f) => {
        if (f.id === funcionarioId) {
          return {
            ...f,
            selecionado: !f.selecionado,
          };
        }
        return f;
      });
    });
  }

  iniciarPagamentos() {}

  private atualizarStatus(id: number, novoStatus: IFuncionario['status']) {}

  private addLog(msg: IMessageLogs) {
    this.consoleLogs.update((logs) => [...logs, msg]);
  }

  private resetarStatus() {}
}
