import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

export interface IFuncionario {
    id: number;
    nome: string;
    selecionado: boolean;
    status: 'pendente' | 'processando' | 'pago' | 'erro';
}

@Injectable({
    providedIn: 'root',
})
export class PagamentosApi {
    getFuncionarios(): Observable<IFuncionario[]> {
        return of([]);
    }

    pagarFuncionario() {

    }
}
