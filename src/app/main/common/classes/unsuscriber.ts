import { Subject } from 'rxjs';

export class Unsubscriber {
  done = new Subject();

  constructor() { }

  complete() {
    this.done.next();
    this.done.complete();
  }
}