import { Component, OnInit } from '@angular/core';
import {Response} from '@angular/http';
import { ValidateService } from '../../services/validate.service';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages'
import { Router } from '@angular/router';

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
    private flashMessagesService: FlashMessagesService,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
  }

  onRegisterSubmit(){
    if (!this.validateService.validateEmail(this.user.email)){
      this.flashMessagesService.show('Invalid email.', {cssClass: 'alert alert-danger', timeout:5000});
      return false;
    }

    //register user
    this.authService.registerUser(this.user).subscribe(data => {
        if (data.success){
          this.flashMessagesService.show('You are now registered and can log in.', {cssClass: 'alert alert-success', timeout:5000});
          this.router.navigate(['/login']);
        } else{
          this.flashMessagesService.show('Something went wrong.', {cssClass: 'alert alert-danger', timeout:5000});
        }
    }, (err: any)=>{
        if (err instanceof Response) {
            const res = err.json();
            if (err.status === 400 && res.error.contains('ValidationError')){
                this.flashMessagesService.show('The form has some validation errors.', {cssClass: 'alert alert-danger', timeout:5000})
            }
        }
    });
  }
}
