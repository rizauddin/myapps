import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myapps2';
  // constructor() {
  //   if (window.location.hostname === 'localhost' && window.location.pathname === '/') {
  //     window.location.href = 'https://www.rizauddin.com';
  //   }
  // }
}
