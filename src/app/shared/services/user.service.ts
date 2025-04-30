import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthenticatedUser } from '../models/auth.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly USER_DATA_KEY = 'userData';
  private readonly TOKEN_KEY = 'authToken';

  private userDataSubject = new BehaviorSubject<AuthenticatedUser | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  readonly userData$: Observable<AuthenticatedUser | null> =
    this.userDataSubject.asObservable();
  readonly token$: Observable<string | null> = this.tokenSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private localStorageService: LocalStorageService
  ) {
    this.loadFromStorage();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadFromStorage(): void {
    if (!this.isBrowser()) return;

    const user = this.localStorageService.getItem<AuthenticatedUser>(
      this.USER_DATA_KEY
    );
    const token = this.localStorageService.getItem<string>(this.TOKEN_KEY);

    this.userDataSubject.next(user ?? null);
    this.tokenSubject.next(token ?? null);
  }

  setUserData(user: AuthenticatedUser): void {
    if (!this.isBrowser()) return;
    this.localStorageService.setItem(this.USER_DATA_KEY, user);
    this.userDataSubject.next(user);
  }

  setToken(token: string): void {
    if (!this.isBrowser()) return;
    this.localStorageService.setItem(this.TOKEN_KEY, token);
    this.tokenSubject.next(token);
  }

  getUserData(): AuthenticatedUser | null {
    return this.userDataSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getUserRole(): string | null {
    return this.userDataSubject.value?.role ?? null;
  }

  getUserCpf(): string | null {
    return this.userDataSubject.value?.cpf ?? null;
  }

  clearUserData(): void {
    if (!this.isBrowser()) return;

    this.localStorageService.removeItem(this.USER_DATA_KEY);
    this.localStorageService.removeItem(this.TOKEN_KEY);

    this.userDataSubject.next(null);
    this.tokenSubject.next(null);
  }
}
