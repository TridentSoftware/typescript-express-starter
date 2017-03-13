import {Directive, OnChanges, SimpleChanges, Input} from '@angular/core';
import {AbstractControl, Validator, ValidatorFn, Validators, NG_VALIDATORS} from '@angular/forms';

@Directive({
  selector: '[username]',
  providers: [{provide: NG_VALIDATORS, useExisting: UsernameValidatorDirective, multi: true}]
})
export class UsernameValidatorDirective implements Validator, OnChanges {
  @Input() username: string;
  private valFn = Validators.nullValidator;

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['username'];
    if (change) {
      this.valFn = usernameValidator();
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  validate(control: AbstractControl): {[key: string]: any} {
    return this.valFn(control);
  }
}

export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    const username = control.value;
    const re = /[A-Za-z][A-Za-z0-9._-]{2,20}/g;
    const yes = re.test(username);
    return !yes ? {'username': {name}} : null;
  }
}
