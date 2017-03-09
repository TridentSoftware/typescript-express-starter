import {Component, OnInit} from '@angular/core';
import {Response} from '@angular/http';
import {AuthService} from '../../services/auth.service';
import {FlashMessagesService} from 'angular2-flash-messages'
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

    constructor(private flashMessagesService: FlashMessagesService,
                private authService: AuthService,
                private router: Router) {
    }

    ngOnInit() {
    }

    onLoginSubmit() {

        // if (!this.validateService.validateLogin(this.login)) {
        //   this.flashMessagesService.show('All fields required.', {cssClass: 'alert alert-danger', timeout: 5000});
        //   return false;
        // }

        this.authService.authenticateUser(this.login).subscribe(data => {
            //console.log(data);
            if (!data.success) {
                this.flashMessagesService.show(data.message, {cssClass: 'alert alert-danger', timeout: 5000});
                return;
            }

            this.authService.storeUserData(data.token, data.user);
            this.flashMessagesService.show('You are now logged in.', {cssClass: 'alert alert-success', timeout: 5000});
            this.router.navigate(['/dashboard']);
        }, (err: any) => {
            if (err instanceof Response) {
                const res = err.json();
                if (err.status === 404)
                    this.flashMessagesService.show('Invalid Username or Password.', {
                        cssClass: 'alert alert-danger',
                        timeout: 5000
                    });
                if (err.status === 400 && res.error === 'LoginDisabled')
                    this.flashMessagesService.show('Your login has been disabled.', {
                        cssClass: 'alert alert-danger',
                        timeout: 5000
                    });
                if (err.status === 400 && res.error === 'InvalidPassword')
                    this.flashMessagesService.show('Invalid Username or Password.', {
                        cssClass: 'alert alert-danger',
                        timeout: 5000
                    });
            }
        });
    }
}
