import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myapps2';
  isLuluske = false;

  onRouteActivate(data: Record<string, unknown>): void {
    this.isLuluske = data['layout'] === 'luluske';
  }
  readonly currentYear = new Date().getFullYear();
  // constructor() {
  //   if (window.location.hostname === 'localhost' && window.location.pathname === '/') {
  //     window.location.href = 'https://www.rizauddin.com';
  //   }
  // }
}
