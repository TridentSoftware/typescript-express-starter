import {Component, OnInit} from '@angular/core';
import {AuthService, UserInfo} from '../../services/auth.service';
import {MessageService} from '../../services/message.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userInfo: UserInfo = {};
  constructor(private messageService: MessageService,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
  }

  getUserInfo() : UserInfo {
    if (this.authService.loggedIn()){
      if(this.userInfo.firstName)
        return this.userInfo;

      while(!this.userInfo.firstName){
        this.userInfo = this.authService.getUserInfo();
      }

      return this.userInfo;
    }
    return this.userInfo;
  }

  onLogoutClick() {
    this.authService.logout();
    this.messageService.success('You have been logged out.');
    this.router.navigate(['/login']);
    return false;
  }
}
