import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  isLoginMode: boolean = true;
  isLoading: boolean = false;
  error: string | null = null;
  passwordVisible: boolean = false;
  passwordVisibleSignUp: boolean = false;
  confirmPasswordVisible: boolean = false;
  signUp!: FormGroup;
  signIn!: FormGroup;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.signIn = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^.{8,}$/),
      ]),
    });
    this.signUp = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^.{8,}$/),
      ]),
      firstname: new FormControl(null, Validators.required),
      lastname: new FormControl(null, Validators.required),
      confirmpassword: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^.{8,}$/),
        this.passwordsMatch.bind(this),
      ]),
    });
    this.authService.user.subscribe((user) => {
      if (user?.token) {
        this.router.navigate(['/'], { replaceUrl: true });
      }
    });
  }
  passwordsMatch(control: FormControl): { [s: string]: boolean } | null {
    if (control.value !== this.signUp?.value?.password) {
      console.log(control.value !== this.signUp?.value?.password);
      return { confirmPAsswordError: true };
    }
    return null;
  }
  onChangeAuth() {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
  }

  onSignUp() {
    this.signUp.markAllAsTouched();
    console.log(this.signUp.valid);
    if (!this.signUp.valid) {
      return;
    }
    const SignUpObs = this.authService.signup(
      this.signUp.value['email'],
      this.signUp.value['password'],
      this.signUp.value['firstname'],
      this.signUp.value['lastname']
    );
    SignUpObs.subscribe(
      (resData) => {
        console.log(resData);
        this.isLoading = false;
        this.router.navigate(['/'], { replaceUrl: true });
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isLoading = false;
      }
    );
  }

  onSignIn() {
    this.signIn.markAllAsTouched();
    console.log(this.signIn.value['email'], this.signIn.value['password']);
    console.log(this.signIn.valid);
    if (!this.signIn.valid) {
      return;
    }
    const SignUpObs = this.authService.login(
      this.signIn.value['email'],
      this.signIn.value['password']
    );
    SignUpObs.subscribe(
      (resData) => {
        console.log(resData);
        this.isLoading = false;
        this.router.navigate(['/'], { replaceUrl: true });
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isLoading = false;
      }
    );
  }
  changePasswordVisiblity(changeVisibility: string) {
    console.log(changeVisibility);
    switch (changeVisibility) {
      case 'passwordSignIn':
        this.passwordVisible = !this.passwordVisible;
        break;
      case 'passwordSignUp':
        this.passwordVisibleSignUp = !this.passwordVisibleSignUp;
        break;
      case 'confirmPassword':
        this.confirmPasswordVisible = !this.confirmPasswordVisible;
        break;
    }
  }
}
