import {Directive, OnChanges, SimpleChanges, Input} from '@angular/core';
import {AbstractControl, Validator, ValidatorFn, Validators, NG_VALIDATORS} from '@angular/forms';
import {ValidateService} from '../services/validate.service';

@Directive({
  selector: '[email]',
  providers: [{provide: NG_VALIDATORS, useExisting: EmailValidatorDirective, multi: true}]
})
export class EmailValidatorDirective implements Validator, OnChanges {
  @Input() email: string;
  private valFn = Validators.nullValidator;

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['email'];
    if (change) {
      this.valFn = emailValidator();
    } else {
      this.valFn = Validators.nullValidator;
    }
  }

  validate(control: AbstractControl): {[key: string]: any} {
    return this.valFn(control);
  }
}

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    const email = control.value;
    const re = ValidateService.validEmailRegex;
    const yes = re.test(email);
    return !yes ? {'email': {name}} : null;
  }
}
