import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PicpayService, Wallet, WalletRequest, TransferRequest } from '../../services/picpay.service';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  walletForm!: FormGroup;
  transferForm!: FormGroup;
  wallets: Wallet[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  isDarkMode = false;

  constructor(
    private fb: FormBuilder,
    private picpayService: PicpayService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadWallets();
    this.loadThemePreference();
  }

  loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    console.log('Loading theme preference:', savedTheme);
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
      console.log('Dark mode applied');
    } else {
      this.isDarkMode = false;
      document.documentElement.setAttribute('data-theme', 'light');
      console.log('Light mode applied');
    }
  }

  toggleTheme(): void {
    console.log('Toggle theme clicked! Current mode:', this.isDarkMode);
    this.isDarkMode = !this.isDarkMode;
    console.log('New mode:', this.isDarkMode);
    
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      console.log('Switched to DARK mode');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      console.log('Switched to LIGHT mode');
    }
    
    // Force re-render
    console.log('HTML element data-theme:', document.documentElement.getAttribute('data-theme'));
  }

  initializeForms(): void {
    this.walletForm = this.fb.group({
      fullName: ['', [Validators.required]],
      cpf: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      type: [0, [Validators.required]],
      initialBalance: [0, [Validators.required, Validators.min(0)]]
    });

    this.transferForm = this.fb.group({
      payerId: ['', [Validators.required]],
      payeeId: ['', [Validators.required]],
      value: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  onCreateWallet(): void {
    if (this.walletForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const walletData: WalletRequest = {
      fullName: this.walletForm.value.fullName,
      cpf: this.walletForm.value.cpf,
      email: this.walletForm.value.email,
      password: this.walletForm.value.password,
      type: parseInt(this.walletForm.value.type),
      initialBalance: parseFloat(this.walletForm.value.initialBalance)
    };

    this.picpayService.createWallet(walletData).subscribe({
      next: () => {
        this.successMessage = 'Carteira criada com sucesso!';
        this.walletForm.reset({
          type: 0,
          initialBalance: 0
        });
        this.loadWallets();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao criar carteira. Tente novamente.';
        this.loading = false;
      }
    });
  }

  onTransfer(): void {
    if (this.transferForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const transferData: TransferRequest = {
      payerId: this.transferForm.value.payerId,
      payeeId: this.transferForm.value.payeeId,
      value: parseFloat(this.transferForm.value.value)
    };

    this.picpayService.transfer(transferData).subscribe({
      next: () => {
        this.successMessage = 'Transferência realizada com sucesso!';
        this.transferForm.reset({
          value: 0
        });
        this.loadWallets();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao realizar transferência. Tente novamente.';
        this.loading = false;
      }
    });
  }

  loadWallets(): void {
    this.loading = true;
    this.errorMessage = '';

    this.picpayService.getWallets().subscribe({
      next: (data) => {
        // Converter o tipo do backend para número
        // Backend retorna: "Shopkeeper" = Lojista (0), "User" = Usuário (1)
        this.wallets = data.map(wallet => ({
          ...wallet,
          type: this.convertTypeToNumber(wallet.type)
        }));
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao carregar carteiras. Tente novamente.';
        this.loading = false;
      }
    });
  }

  convertTypeToNumber(type: number | string | undefined): number {
    if (type === undefined || type === null) {
      return 1; // Default para Usuário
    }

    // Se já é número
    if (typeof type === 'number') {
      return type;
    }

    // Se é string, converter
    const typeStr = String(type).toLowerCase().trim();
    
    // "Shopkeeper" ou "lojista" = 0
    if (typeStr === 'shopkeeper' || typeStr === 'lojista' || typeStr === '0') {
      return 0;
    }
    
    // "User" ou "usuário" = 1
    if (typeStr === 'user' || typeStr === 'usuário' || typeStr === '1') {
      return 1;
    }

    // Tentar converter para número
    const num = parseInt(typeStr, 10);
    if (!isNaN(num)) {
      return num;
    }

    // Default para Usuário se não conseguir converter
    return 1;
  }

  isLojista(type: number | string | undefined): boolean {
    const typeNum = this.convertTypeToNumber(type);
    return typeNum === 0;
  }
}
