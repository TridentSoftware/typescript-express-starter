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
  }();

  constructor(private messageService: MessageService,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
  }

  onLoginSubmit() {
    this.authService.authenticateUser(this.login).subscribe(data => {
      this.authService.storeUserData(data.token, data.user);
      this.messageService.success('You are now logged in.');
      this.router.navigate(['/dashboard']);
    }, (err: any) => {
      if (err instanceof Response) {
        const res = err.json();
        this.messageService.danger(res.message);
      }
    });
  }
}
