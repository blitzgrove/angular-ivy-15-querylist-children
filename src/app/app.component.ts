import {
  Component,
  Input,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { of, combineLatest, from, Subject } from 'rxjs';
import { takeUntil, take, tap, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'child',
  template: `I am child component {{id}}`,
})
export class ChildComponent {
  @Input() id: number;
  instance$ = from([1, 2, 3]);
}

@Component({
  selector: 'parent',
  template: `
    <button (click)="onAdd()" class="add">Add</button>
    <div *ngFor="let id of childIds; let idx = index">
      <child [id]="id"></child>
      <button (click)="onDelete(idx)" class="delete">Delete</button>
    </div>

    <p>Instances from children: {{ instances | json }}</p>
  `,
  styles: [
    `
    div {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: space-between;
      max-width: 45vw;
      padding: 6px;
      border-radius: 6px;
    }

    div:hover {
      background: #eee;
    }

    button {
      cursor: pointer;
      transition: all 0.1s ease-in-out;
      min-width: 75px;
      min-height: 1.75rem;
      border-radius: 4px;
    }

    button.delete {
      border: 1px solid #ffcece;
      background-color: #ffecec;
    }

    button.delete:hover {
      border: 1px solid #ff8787;
      background-color: #ffcdcd;
    }

    button.delete:active {
      border: 1px solid #ff7070;
      background-color: #ffb6b6;
    }

    button.add {
      margin-bottom: 6px;
      border: 1px solid #c0e9ff;
      background-color: #e5f6ff;
    }

    button.add:hover {
      border: 1px solid #87c9ff;
      background-color: #cdecff;
    }

    button.add:active {
      border: 1px solid #70d9ff;
      background-color: #b6e3ff;
    }
  `,
  ],
})
export class AppComponent {
  @ViewChildren(ChildComponent) childComponents!: QueryList<ChildComponent>;
  close = new Subject<void>();
  instances: number[];

  childIds = Array(10)
    .fill(0)
    .map((i, index) => index + 1);

  ngAfterViewInit(): void {
    this.childComponents.changes
      .pipe(
        switchMap((children: QueryList<ChildComponent>) =>
          combineLatest(
            children.map((child: ChildComponent) => child.instance$)
          )
        ),
        takeUntil(this.close)
      )
      .subscribe({
        next: (instances: number[]) => {
          console.log('Instances:', instances);
          this.instances = instances;
        },
      });

    /*
    combineLatest(
      this.childComponents.map((child: ChildComponent) => {
        return child.instance$;
      })
    )
      .pipe(take(1))
      .subscribe({
        next: (instances: number[]) => {
          this.instances = instances;
        },
      });
    */
  }

  onDelete(index: number) {
    this.childIds.splice(index, 1);
  }

  onAdd() {
    this.childIds = [
      ...this.childIds,
      (this.childIds[this.childIds.length - 1] ?? 0) + 1,
    ];
  }

  ngOnDestroy() {
    this.close.next();
  }
}
