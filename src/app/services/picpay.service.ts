import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'https://localhost:7192';

export interface TransferRequest {
  payerId: string;
  payeeId: string;
  value: number;
}

export interface WalletRequest {
  fullName: string;
  cpf: string;
  email: string;
  password: string;
  type: number;
  initialBalance: number;
}

export interface Wallet {
  id?: string;
  fullName: string;
  cpf: string;
  email: string;
  type: number;
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class PicpayService {
  private apiUrl = API_URL;

  constructor(private http: HttpClient) { }

  /**
   * Realiza uma transferência entre carteiras
   * @param transfer Dados da transferência (payerId, payeeId, value)
   * @returns Observable com a resposta da API
   */
  transfer(transfer: TransferRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, transfer);
  }

  /**
   * Cria uma nova carteira
   * @param wallet Dados da carteira a ser criada
   * @returns Observable com a resposta da API
   */
  createWallet(wallet: WalletRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallets`, wallet);
  }

  /**
   * Lista todas as carteiras
   * @returns Observable com a lista de carteiras
   */
  getWallets(): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(`${this.apiUrl}/wallets`);
  }
}
