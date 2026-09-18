import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, concatMap, delay, map, Observable, of, throwError } from 'rxjs';

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
  getFuncionarios(): Observable<IFuncionario[]> {
    const tempoAleatorio = Math.floor(Math.random() * 4000) + 1000;

    if (tempoAleatorio < 4000) {
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
        delay(tempoAleatorio),
        map((funcionarios) =>
          funcionarios.map((funcionario) => ({
            ...funcionario,
            selecionado: true,
            status: 'pendente',
          })),
        ),
      );
    } else {
      const simulacaoHttpError = new HttpErrorResponse({
        error: {
          mensagem: 'Ocorreu um erro sistêmico ao buscar os funcionários',
          codigoInterno: 'ERR_FUNC_500',
        },
        status: 500,
        statusText: 'Internal Server Error',
      });
      return of(true).pipe(
        delay(2000),
        concatMap(() => throwError(() => simulacaoHttpError)),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 500) {
            return throwError(() => error.error.mensagem);
          }
          return throwError(() => 'Ocorreu um erro ao buscar os funcionários');
        }),
      );
    }
  }

  pagarFuncionario(funcionario: IFuncionario) {
    const tempoAleatorio = Math.floor(Math.random() * 4000) + 1000;

    const responseSucesso: IPagamentoResponse = {
      mensagem: 'Pagamento realizado com sucesso',
      funcionario: {
        id: funcionario.id,
        nome: funcionario.nome,
      },
    };

    return of(responseSucesso).pipe(
      delay(tempoAleatorio),
      map((pagamentoResponse) => {
        const { id, nome } = pagamentoResponse.funcionario;

        if (id === 2) {
          throw {
            message: `Erro ao processar pagamento de ${nome}`,
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
