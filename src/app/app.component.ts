import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LuluskeComponent } from './luluske/luluske.component';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myapps2';
  isLuluske = false;

  onRouteActivate(component: unknown): void {
    this.isLuluske = component instanceof LuluskeComponent;
  }
  readonly currentYear = new Date().getFullYear();
  // constructor() {
  //   if (window.location.hostname === 'localhost' && window.location.pathname === '/') {
  //     window.location.href = 'https://www.rizauddin.com';
  //   }
  // }
}
