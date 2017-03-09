import { Injectable } from '@angular/core';
import {FlashMessagesService} from 'angular2-flash-messages';
@Injectable()
export class MessageService {
  private timeout: number = 5000;

  constructor(private flashMessagesService: FlashMessagesService) { }

  danger(message: string){
    this.flashMessagesService.show(message, {
      cssClass: 'alert alert-danger',
      timeout: this.timeout
    });
  }

  warn(message: string){
    this.flashMessagesService.show(message, {
      cssClass: 'alert alert-warning',
      timeout: this.timeout
    });
  }

  info(message: string){
    this.flashMessagesService.show(message, {
      cssClass: 'alert alert-info',
      timeout: this.timeout
    });
  }

  success(message: string){
    this.flashMessagesService.show(message, {
      cssClass: 'alert alert-success',
      timeout: this.timeout
    });
  }
}
