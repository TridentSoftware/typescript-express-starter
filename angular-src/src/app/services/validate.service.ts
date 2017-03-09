import {Injectable} from '@angular/core';

@Injectable()
export class ValidateService {
  public static validEmailRegex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  constructor() {
  }

  validateEmail(email) {
    return ValidateService.validEmailRegex.test(email);
  }
}
