import {Directive, AfterViewInit, ElementRef, Renderer} from '@angular/core';

/**
 * https://github.com/strictd/ng2-set-focus/blob/master/src/set-focus.ts
 * */
@Directive({
  selector: '[set-focus]'
})
export class SetFocusDirective implements AfterViewInit {

  constructor(public renderer: Renderer, public elementRef: ElementRef) {
  }

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(
      this.elementRef.nativeElement, 'focus', []);
  }
}
