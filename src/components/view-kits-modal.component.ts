import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FootballService } from '../services/football.service';
import { NgForOf } from '@angular/common';
import { NgIf } from "@angular/common"
@Component({
  selector: "app-view-kits-modal",
  template: `
    <div class="modal">
      <svg
        (click)="closeModal()"
        class="w-6 h-6 text-gray-800 dark:text-white close-icon"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>

      <div class="modal-header">
        <img [src]="teamDetails.crest" alt="" />
        <h2>{{ teamDetails.name }}</h2>
        <h2>Recent Kits</h2>
      </div>
      <div>
        <div *ngIf="!loading" class="kits-container">
          <div class="kit-card" *ngFor="let kit of kits">
            <img [src]="kit.strEquipment" alt="{{ kit.strType }} Kit" />
            <p>{{ kit.strType }}</p>
            <p>{{ kit.strSeason }}</p>
          </div>
        </div>
        <div *ngIf="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>{{loadedImages? 'Rendering' : 'Loading'}} Kits...</p>
          </div>
      </div>
    </div>
  `,
  standalone: true,
  styles: [
    `
      .modal {
        width: 100%;
        height: 100%;
        background-color: black;
      }
      .modal-header {
        justify-self: center;
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
        img {
          width: 50px;
          height: 50px;
        }
      }

      .kits-container {
        background-color: black;
        display: flex;
        width: 100%;
        overflow: auto;
        flex-flow: wrap;
        justify-content: center;
      }
      .kit-card {
        width: 300px;
        justify-items: center;
        margin-bottom: 20px;
        img {
          width: 300px;
        }
      }

      .close-icon {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 40px;
        height: 40px;
        cursor: pointer;
      }

          .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem;
      color: #9ca3af;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(59, 130, 246, 0.1);
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    `,
  ],
  imports: [NgForOf, NgIf],
})
export class ViewKitsModalComponent implements OnInit {
  teamDetails: any;
  kits: Equipment[] = [];
  loading: boolean = false;
  loadedImages: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<ViewKitsModalComponent>,
    private footballService: FootballService,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    if (data) {
      this.teamDetails = data.teamDetails;
    }
  }
  ngOnInit() {
    this.getKits();
  }

  getKits() {
    this.loading = true;
    this.footballService.getAllKits(this.teamDetails.id).subscribe((res) => {
      this.kits = sortEquipments(res);
      this.loadedImages = true
      setTimeout(() => {
      this.loading = false;
      },2000);
    },
    (error) => {
      this.loading = false;
  });
}

  closeModal() {
    this.dialogRef.close();
  }
}

interface Equipment {
    date: string;
    idEquipment: string;
    idTeam: string;
    strEquipment: string;
    strSeason: string;
    strType: string;
    strUsername: string;
}

function sortEquipments(equipments: Equipment[]): Equipment[] {
    // Custom order for strType
    const typePriority: Record<string, number> = {
        "Home": 1,
        "Away": 2,
        "Goalkeeper": 3,
        "1st": 4,
        "2nd": 5,
        "3rd": 6,
        "4th": 7,
        "5th": 8,
        "Alternate": 9,
    };

    return equipments.sort((a, b) => {

        const seasonA = parseInt(a.strSeason.split("-")[0]);
        const seasonB = parseInt(b.strSeason.split("-")[0]);
        if (seasonA !== seasonB) {
            return seasonB - seasonA;
        }

        const priorityA = typePriority[a.strType] ?? 99;
        const priorityB = typePriority[b.strType] ?? 99;
        return priorityA - priorityB;
    });
}