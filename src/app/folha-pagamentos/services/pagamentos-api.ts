import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';

export interface IFuncionario {
  id: number;
  nome: string;
  selecionado: boolean;
  status: 'pendente' | 'processando' | 'pago' | 'erro';
}

export interface IPagamentoResponse {
  mensagem: string;
  funcionario: Partial<IFuncionario>;
}

@Injectable({
  providedIn: 'root',
})
export class PagamentosApi {
  private readonly tempoAleatorio = Math.floor(Math.random() * 4000) + 1000;

  getFuncionarios(): Observable<IFuncionario[]> {
    return of([
      {
        id: 0,
        nome: 'João Pedro',
      },
      {
        id: 1,
        nome: 'Maria Silva',
      },
      {
        id: 2,
        nome: 'Pedro Almeida',
      },
      {
        id: 3,
        nome: 'Ana Oliveira',
      },
    ]).pipe(
      delay(this.tempoAleatorio),
      map((funcionarios) =>
        funcionarios.map((funcionario) => ({
          ...funcionario,
          selecionado: true,
          status: 'pendente',
        })),
      ),
    );
  }

  pagarFuncionario(funcionario: IFuncionario) {
    const responseSucesso: IPagamentoResponse = {
      mensagem: 'Pagamento realizado com sucesso',
      funcionario: {
        id: funcionario.id,
        nome: funcionario.nome,
      },
    };

    return of(responseSucesso).pipe(
      delay(this.tempoAleatorio),
      map((pagamentoResponse) => {
        const { id, nome } = pagamentoResponse.funcionario;

        if (id === 2) {
          throw {
            message: 'Erro ao processar pagamento',
            funcionario: {
              id,
              nome,
            },
          };
        }

        return responseSucesso;
      }),
    );
  }
}
