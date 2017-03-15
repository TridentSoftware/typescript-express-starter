import {Component, OnInit} from '@angular/core';
import {Response} from '@angular/http';
import {AuthService} from '../../services/auth.service';
import {MessageService} from '../../services/message.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  login = new class Login {
    public username: string;
    public password: string;
    public rememberMe: boolean;
  }();

  constructor(private messageService: MessageService,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
  }

  onLoginSubmit() {
    //fix for phones leaving trailing space
    this.login.username = this.login.username.trim();
    this.authService.authenticateUser(this.login).then(data => {
      this.authService.storeUserData(data.token, data.user, this.login.rememberMe);
      this.messageService.success('You are now logged in.');
      this.router.navigate(['/dashboard']);
    }).catch((err: any) => {
      if (err instanceof Response) {
        const res = err.json();
        this.messageService.danger(res.message);
      }
    });
  }
}
