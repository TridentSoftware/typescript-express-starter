import {Component, OnInit} from '@angular/core';
import {Response} from '@angular/http';
import {ValidateService} from '../../services/validate.service';
import {AuthService} from '../../services/auth.service';
import {MessageService} from '../../services/message.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  user = new class User {
    public firstName: string;
    public lastName: string;
    public email: string;
    public username: string;
    public password: string;
  }();

  constructor(private validateService: ValidateService,
              private messageService: MessageService,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
  }

  onRegisterSubmit() {
    //double check this, also in a directive
    if (!this.validateService.validateEmail(this.user.email)) {
      this.messageService.danger('Invalid email.');
      return false;
    }

    //register user
    this.authService.registerUser(this.user).then(data => {
      if (data.success) {
        this.messageService.success('You are now registered and can log in.');
        this.router.navigate(['/login']);
      } else {
        this.messageService.danger('Something went wrong.');
      }
    }).catch((err: any) => {
      if (err instanceof Response) {
        const res = err.json();
        this.messageService.danger(res.message);
      }
    });
  }
}
