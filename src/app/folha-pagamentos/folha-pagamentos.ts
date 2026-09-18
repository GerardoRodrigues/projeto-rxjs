import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { IFuncionario, IPagamentoResponse, PagamentosApi } from './services/pagamentos-api';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, concatMap, EMPTY, finalize, from, of, tap } from 'rxjs';

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

  iniciarPagamentos() {
    this.consoleLogs.set([{ message: 'Iniciando processamento...', status: 'loading' }]);
    this.resetarStatus();
    this.processando.set(true);

    if (this.funcionariosSelecionados().length === 0) {
      this.addLog({ message: 'Nenhum funcionário selecionado.', status: 'loading' });
      this.processando.set(false);
      return;
    }

    from(this.funcionariosSelecionados())
      .pipe(
        concatMap((funcionario) => {
          this.atualizarStatus(funcionario.id, 'processando');
          this.addLog({ message: `Pagando ${funcionario.nome}`, status: 'loading' });

          return this._pagamentosApi.pagarFuncionario(funcionario).pipe(
            tap(() => {
              this.atualizarStatus(funcionario.id, 'pago');
              this.addLog({
                message: `Pagamento realizado com sucesso para ${funcionario.nome}`,
                status: 'success',
              });
            }),
            catchError((error: IPagamentoResponse) => {
              this.atualizarStatus(funcionario.id, 'erro');
              this.addLog({
                message: `Erro ao pagar ${funcionario.nome}: ${error.mensagem}`,
                status: 'error',
              });
              return EMPTY;
            }),
          );
        }),
        finalize(() => {
          this.addLog({ message: 'Processamento concluído.', status: 'success' });
          this.processando.set(false);
        }),
      )
      .subscribe();
  }

  private atualizarStatus(id: number, novoStatus: IFuncionario['status']) {
    this.funcionarios.update((funcionarios) => {
      return funcionarios.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            status: novoStatus,
          };
        }
        return f;
      });
    });
  }

  private addLog(msg: IMessageLogs) {
    this.consoleLogs.update((logs) => [...logs, msg]);
  }

  private resetarStatus() {
    this.funcionarios.update((funcionarios) => {
      return funcionarios.map((f) => ({
        ...f,
        status: 'pendente',
      }));
    });
  }
}
