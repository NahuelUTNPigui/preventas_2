import { Component, Input } from "@angular/core";

@Component({
  selector: "app-icon",
  template: `
    <ng-container *ngIf="iconName === 'whatsapp'">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        [attr.width]="width || '24'"
        [attr.height]="height || '24'"
        viewBox="0 0 24 24"
      >
        <path
          [attr.fill]="color || 'currentColor'"
          d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07c0 1.22.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28z"
        />
      </svg>
    </ng-container>

    <ng-container *ngIf="iconName === 'reject'">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 48 48"
      >
        <rect
          [attr.width]="width || '24'"
          [attr.height]="height || '24'"
          fill="none"
        />
        <g
          fill="none"
          stroke="#000"
          [attr.stroke]="color || 'currentColor'"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="4"
        >
          <path
            d="M19.0099 42H9C7.34315 42 6 40.6569 6 39V9C6 7.34315 7.34315 6 9 6H39C40.6569 6 42 7.34315 42 9V19.0304"
          />
          <path
            d="M42 29.0347V41.0001C42 41.5524 41.5523 42.0001 41 42.0001H29.037"
          />
          <path d="M42 29.0347H18" />
          <path d="M23 23L17 29L23 35" />
        </g>
      </svg>
    </ng-container>

    <ng-container *ngIf="iconName === 'restoreVersion'">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        [attr.width]="width || '24'"
        [attr.height]="height || '24'"
        viewBox="0 0 24 24"
      >
        <rect width="24" height="24" fill="none" />
        <path
          fill="none"
          [attr.stroke]="color || 'currentColor'"
          stroke-dasharray="48"
          stroke-dashoffset="48"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4.25 14C5.14 17.45 8.27 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C9.61 4 7.47 5.05 6 6.71L4 9"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            dur="0.6s"
            values="48;0"
          />
        </path>
        <g [attr.fill]="color || 'currentColor'">
          <path
            fill-opacity="0"
            d="M3.25 10H3.89645C4.11917 10 4.23071 9.73071 4.07322 9.57322L3.42678 8.92678C3.26929 8.76929 3 8.88083 3 9.10355V9.75C3 9.88807 3.11193 10 3.25 10Z"
          >
            <set attributeName="fill-opacity" begin="0.6s" to="1" />
            <animate
              fill="freeze"
              attributeName="d"
              begin="0.6s"
              dur="0.2s"
              values="M3.25 10H3.89645C4.11917 10 4.23071 9.73071 4.07322 9.57322L3.42678 8.92678C3.26929 8.76929 3 8.88083 3 9.10355V9.75C3 9.88807 3.11193 10 3.25 10Z;M3.5 10H7.79289C8.23835 10 8.46143 9.46143 8.14645 9.14645L3.85355 4.85355C3.53857 4.53857 3 4.76165 3 5.20711V9.5C3 9.77614 3.22386 10 3.5 10Z"
            />
          </path>
          <circle cx="12" cy="12" r="0">
            <animate
              fill="freeze"
              attributeName="r"
              begin="0.8s"
              dur="0.2s"
              values="0;2"
            />
          </circle>
        </g>
      </svg>
    </ng-container>

    <ng-container *ngIf="iconName === 'restore'">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        [attr.width]="width || '24'"
        [attr.height]="height || '24'"
        viewBox="0 0 32 32"
      >
        <rect width="32" height="32" fill="none" />
        <path
          [attr.fill]="color || 'currentColor'"
          d="M14 4c-.523 0-1.059.184-1.438.563C12.185 4.94 12 5.476 12 6v1H5v2h1.094L8 27.094l.094.906h15.812l.094-.906L25.906 9H27V7h-7V6c0-.523-.183-1.059-.563-1.438C19.06 4.184 18.523 4 18 4zm0 2h4v1h-4zM8.125 9h15.75l-1.781 17H9.906zM16 12l-4 4h3v7h2v-7h3z"
        />
      </svg>
    </ng-container>
    <ng-container *ngIf="iconName === 'history'">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        [attr.width]="width || '24'"
        [attr.height]="height || '24'"
        viewBox="0 0 24 24"
      >
        <rect width="24" height="24" fill="none" />
        <path
          [attr.fill]="color || 'currentColor'"
          d="M13.5 8H12v5l4.28 2.54l.72-1.21l-3.5-2.08zM13 3a9 9 0 0 0-9 9H1l3.96 4.03L9 12H6a7 7 0 0 1 7-7a7 7 0 0 1 7 7a7 7 0 0 1-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.896 8.896 0 0 0 13 21a9 9 0 0 0 9-9a9 9 0 0 0-9-9"
        />
      </svg>
    </ng-container>

    <ng-container *ngIf="iconName === 'recycle'">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        [attr.width]="width || '24'"
        [attr.height]="height || '24'"
        viewBox="0 0 24 24"
      >
        <rect width="24" height="24" fill="none" />
        <path
          [attr.fill]="color || 'currentColor'"
          d="M7.49 1c.399 0 .78.16 1.06.443L11 3.92V2.75c0-.966.784-1.75 1.75-1.75h3.5c.966 0 1.75.784 1.75 1.75V5.5h1.372a.75.75 0 0 1 .746.83l-1.477 13.662A2.25 2.25 0 0 1 16.404 22H7.596a2.25 2.25 0 0 1-2.236-2.008L3.878 6.332a.75.75 0 0 1 .746-.831H6V2.49C6 1.667 6.667 1 7.49 1m9.01 4.5V2.75a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25V5.5zm-9-2.986V5.5h2.953zM6.85 19.83a.75.75 0 0 0 .746.669h8.808a.75.75 0 0 0 .745-.67L18.537 7H5.46zm4.942-9.422a.25.25 0 0 1 .416 0l.669 1a.75.75 0 0 0 1.246-.834l-.668-1a1.75 1.75 0 0 0-2.91 0l-.668 1a.75.75 0 0 0 1.246.834zM9.636 12.6a.75.75 0 0 1 .257 1.03l-.364.606a.5.5 0 0 0 .429.757h.792a.75.75 0 0 1 0 1.5h-.792c-1.555 0-2.515-1.696-1.715-3.029l.364-.607a.75.75 0 0 1 1.029-.257m4.473 1.029a.75.75 0 1 1 1.287-.771l.364.607c.798 1.333-.162 3.028-1.716 3.028h-.794a.75.75 0 0 1 0-1.5h.794a.5.5 0 0 0 .429-.757z"
        />
      </svg>
    </ng-container>

    <ng-template #defaultIcon>
      <div>Icono no encontrado</div>
    </ng-template>
  `,
})
export class AppIconComponent {
  @Input() iconName: string;
  @Input() width: string;
  @Input() height: string;
  @Input() color: string;
}
