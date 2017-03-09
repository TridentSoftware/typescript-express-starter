import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {MessageService} from '../../services/message.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private messageService: MessageService,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
  }

  onLogoutClick() {
    this.authService.logout();
    this.messageService.success('You have been logged out.');
    this.router.navigate(['/login']);
    return false;
  }
}
