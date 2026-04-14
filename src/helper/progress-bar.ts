import { Component } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="progress-loader">
      <div class="bar bar1"></div>
      <div class="bar bar2"></div>
    </div>
  `,
  styles: [`
    .progress-loader {
      position: relative;
      width: 100%;
      height: 4px;
      background: transparent;
      overflow: hidden;
      border-radius: 4px;
    }

    .bar {
      position: absolute;
      height: 100%;
      background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      border-radius: 4px;
    }

    .bar1 {
      animation: indeterminate1 1s infinite;
    }

    .bar2 {
      animation: indeterminate2 2s infinite;
    }

    @keyframes indeterminate1 {
      0% {
        left: -35%;
        right: 100%;
      }
      60% {
        left: 100%;
        right: -90%;
      }
      100% {
        left: 100%;
        right: -90%;
      }
    }

    @keyframes indeterminate2 {
      0% {
        left: -200%;
        right: 100%;
      }
      60% {
        left: 107%;
        right: -8%;
      }
      100% {
        left: 107%;
        right: -8%;
      }
    }
  `]
})
export class ProgressBarComponent {}