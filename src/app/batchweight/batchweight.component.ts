import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

interface Ingredient {
  name: string;
  part: number;
  density: number;
  volume: number;
  batchWeight: number;
}

@Component({
  selector: 'app-batchweight',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './batchweight.component.html',
  styleUrl: './batchweight.component.css'
})
export class BatchweightComponent implements OnInit {
  public constructor(private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('Batch Weight Calculator');
    this.recalculateAll();
  }

  recalculateAll(): void {
    this.calcOptimumVolume();
    //this.calcEachParts();
    this.calcEachVolumes();
    this.calcTotalPart();
    this.calcTotalVolume();
    this.calcTotalDensity();
    this.calcFillFactor();
    this.calcBatchWeights();
    this.calcTotalBatchWeight();
    this.calcFormulationDensity();
    this.calcBatchVolume();
  }

  ingredients: Ingredient[] = [
    {
      "name": "SMR 10",
      "part": 100,
      "density": 0.94,
      "volume": 0,
      "batchWeight": 0
    },
    {
      "name": "Zinc oxide",
      "part": 10,
      "density": 5.55,
      "volume": 1.8,
      "batchWeight": 2.58
    },
    {
      "name": "Stearic acid",
      "part": 2,
      "density": 0.92,
      "volume": 2.2,
      "batchWeight": 0.52
    },
    // {
    //   "name": "N550 Carbon Black",
    //   "part": 50,
    //   "density": 1.8,
    //   "volume": 27.8,
    //   "batchWeight": 12.90
    // },
    // {
    //   "name": "Oil (naphtenic)",
    //   "part": 10,
    //   "density": 0.92,
    //   "volume": 10.9,
    //   "batchWeight": 2.58
    // },
    // {
    //   "name": "Antioxidant TMQ",
    //   "part": 2,
    //   "density": 1.08,
    //   "volume": 1.9,
    //   "batchWeight": 0.52
    // },    {
    //   "name": "Antiozonant DPPD",
    //   "part": 2,
    //   "density": 1.22,
    //   "volume": 1.6,
    //   "batchWeight": 0.52
    // },
    // {
    //   "name": "Sulphur",
    //   "part": 0.25,
    //   "density": 2.07,
    //   "volume": 0.1,
    //   "batchWeight": 0.06
    // },
    // {
    //   "name": "TBBS",
    //   "part": 2.1,
    //   "density": 1.29,
    //   "volume": 1.6,
    //   "batchWeight": 0.54
    // },    {
    //   "name": "TMTD",
    //   "part": 1,
    //   "density": 1.35,
    //   "volume": 0.7,
    //   "batchWeight": 0.26
    // },
  ];

  mixerVolume: number = 50;
  optimumVolumePercent: number = 80;
  optimumVolume: number = 0;
  totalPart: number = 0;
  totalVolume: number = 0;
  totalDensity: number = 0;
  totalBatchWeight: number = 0;
  fillFactor: number = 0;
  formulationDensity: number = 0;
  batchVolume: number = 0;

  calcOptimumVolume(): void {
    this.optimumVolume = this.mixerVolume * this.optimumVolumePercent / 100;
  }

  calcTotalPart(): void {
    this.totalPart = this.ingredients.reduce((acc, cur) => acc + cur.part, 0);
  }

  calcTotalVolume(): void {
    this.totalVolume = this.ingredients.reduce((acc, cur) => acc + cur.volume, 0);
  }

  calcTotalDensity(): void {
    this.totalDensity = this.totalPart / this.totalVolume;
  }

  calcFormulationDensity(): void {
    this.formulationDensity = this.totalPart / this.totalVolume;
  }

  calcTotalBatchWeight(): void {
    this.totalBatchWeight = this.ingredients.reduce((acc, cur) => acc + cur.batchWeight, 0);
  }

  calcBatchWeights(): void {
    this.ingredients.forEach((ingredient, index) => {
      this.calcBatchWeight(index);
    });
  }

  calcBatchWeight(index: number): number {
    this.ingredients[index].batchWeight = this.ingredients[index].part * this.fillFactor;
    return this.ingredients[index].batchWeight;
  }

  calcEachVolumes(): void {
    this.ingredients.forEach((ingredient, index) => {
      this.calcVolume(index);
    });
  }

  calcVolume(index: number): number {
    this.ingredients[index].volume = this.ingredients[index].part / this.ingredients[index].density;
    return this.ingredients[index].volume;
  }

  calcFillFactor(): void {
    this.fillFactor = this.optimumVolume / this.totalVolume;
  }

  calcBatchVolume(): void {
    this.batchVolume = this.totalBatchWeight / this.formulationDensity;
  }

  // deleteRow(index: number): void {
  //   this.ingredients.splice(index, 1);
  //   this.recalculateAll();
  // }

  deleteRow(index: number): void {
    const isConfirmed = window.confirm('Are you sure you want to delete this ingredient?');
    if (isConfirmed) {
      this.ingredients.splice(index, 1);
      this.recalculateAll();
    }
  }

  addRow(): void {
    const newIngredient = {
      name: 'New Ingredient', // default name or prompt user for input
      part: 0.1, // default value
      density: 0.1, // default value
      volume: 0.1, // default value
      batchWeight: 0.1, // default value
    };
    this.ingredients.push(newIngredient);
    this.recalculateAll(); // Recalculate totals and factors
  }

  editCell(column: string, rowIndex: number): void {
    const newValue = prompt(`Enter new ${column}`);
    if (newValue !== null) {
      switch (column) {
        case 'name':
          this.ingredients[rowIndex].name = newValue;
          break;
        case 'part':
        case 'density':
          const numericValue = parseFloat(newValue);
          if (!isNaN(numericValue)) {
            this.ingredients[rowIndex][column] = numericValue;
            this.recalculateAll(); // Recalculate if necessary
          } else {
            alert('Please enter a valid number');
          }
          break;
        // Handle other cases if necessary
      }
    }
  }

  onOptimumVolumePercentChange(event: any): void {
    this.optimumVolumePercent = event.target.value;
    this.calcOptimumVolume();
    this.recalculateAll(); // Recalculate other values if needed
  }

  editMixerVolume(): void {``
    const newValue = prompt('Enter new Mixer Volume');
    if (newValue !== null) {
      const numericValue = parseFloat(newValue);
      if (!isNaN(numericValue) && numericValue >= 0) {
        this.mixerVolume = numericValue;
        this.recalculateAll(); // Recalculate dependent values
      } else {
        alert('Please enter a valid positive number');
      }
    }
  }
  
  
}
