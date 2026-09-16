import { Component } from '@angular/core';
import { FolhaPagamentos } from './folha-pagamentos/folha-pagamentos';

@Component({
  selector: 'app-root',
  imports: [FolhaPagamentos],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
