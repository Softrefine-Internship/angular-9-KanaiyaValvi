import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, tap, throwError } from 'rxjs';
import { UserModel } from './user.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<UserModel | null>(null);
  private tokenExpriraiontimer: any;

  constructor(private http: HttpClient, private router: Router) {}
  signup(email: string, password: string, firstName: string, lastName: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCFd414BZUc1gn6b2UCp44sLqP2fnHQe8o`,
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(
        catchError(this.handelError),
        tap((resData) => {
          this.createUser(firstName, lastName, resData.localId, email);
          this.handelAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCFd414BZUc1gn6b2UCp44sLqP2fnHQe8o',
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(
        catchError(this.handelError),
        tap((resData) => {
          this.handelAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }
  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData) {
      return;
    }

    const loadedUser = new UserModel(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    // return;

    if (userData._token) {
      this.user.next(loadedUser);
      const exporationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(exporationDuration);
    } else {
      console.log('unautherized ');
    }
  }
  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpriraiontimer) {
      clearTimeout(this.tokenExpriraiontimer);
    }
    this.tokenExpriraiontimer = null;
  }

  autoLogout(exporationDuration: number) {
    this.tokenExpriraiontimer = setTimeout(() => {
      this.logout();
    }, exporationDuration);
  }

  private createUser(
    firstName: string,
    lasetName: string,
    localId: string,
    email: string
  ) {
    this.http
      .post<any>(
        'https://angular-blogs-12b00-default-rtdb.firebaseio.com/user.json',

        { firstName, lasetName, localId, email }
      )
      .subscribe((response) => {
        return response;
      });
  }

  getUser(userId: string) {
    console.log('userId', userId);

    return this.http
      .get<any>(
        'https://angular-blogs-12b00-default-rtdb.firebaseio.com/user.json'
      )
      .pipe(
        map((data) => {
          let userData: any[] = [];
          Object.keys(data).forEach((item) => {
            userData.push({ ...data[item], id: item });
          });
          const user = userData.filter((user) => user.localId === userId);
          return user[0];
        })
      );
  }

  private async handelAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new UserModel(email, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handelError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An Unkonw error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'Invalid password';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'Email not found';
        break;
      case 'INVALID_LOGIN_CREDENTIALS':
        errorMessage = 'Invalid login credentials';
        break;
    }
    return throwError(errorMessage);
  }
}
