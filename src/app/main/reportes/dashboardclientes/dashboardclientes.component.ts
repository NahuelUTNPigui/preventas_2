import { Component, OnInit,Input,ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart
} from "ng-apexcharts";
export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};
@Component({
  selector: 'app-dashboardclientes',
  
  templateUrl: './dashboardclientes.component.html',
  styleUrls: ['./dashboardclientes.component.scss']
})
export class DashboardclientesComponent implements OnInit {

  @Input() filascliente = []
  @Input() filas = []
  @Input() totalkilos = 0
  @Input() totalbultos = 0
  @Input() total = 0
  @ViewChild("charteco") charteco: ChartComponent;
  @ViewChild("chartkil") chartkil: ChartComponent;
  @ViewChild("chartbul") chartbul: ChartComponent;

  
  public chartOptionseco: Partial<ChartOptions>;
  public chartOptionskil: Partial<ChartOptions>;
  public chartOptionsbul: Partial<ChartOptions>;
  constructor() { }

  ngOnInit(): void {
    this.barTotal()
    this.barKilos()
    this.barBultos()
  }
  barTotal(){
    let array1 = this.filascliente.map(fc=>Math.round(fc.total * 100) / 100);
    let array2 = this.filascliente.map(fc=>fc.nombre);

    let combined = array1.map((value, index) => [value, array2[index]]);
    combined.sort((a, b) => a[0] > b[0]?-1:1);

    let series = combined.map(pair => pair[0]);
    let labels = combined.map(pair => pair[1]);
    //let series =this.filascliente.map(fc=>fc.total)
    //let labels = this.filascliente.map(fc=>fc.nombre)
    this.chartOptionseco = {
      
      series,
      chart: {
        height: '300',
        type: "pie"
      },
      labels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: '100%'
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }
  barKilos(){
    let array1 = this.filascliente.map(fc=>Math.round(fc.kilos * 100) / 100);
    let array2 = this.filascliente.map(fc=>fc.nombre);

    let combined = array1.map((value, index) => [value, array2[index]]);
    combined.sort((a, b) => a[0] > b[0]?-1:1);

    let series = combined.map(pair => pair[0]);
    let labels = combined.map(pair => pair[1]);
    this.chartOptionskil = {
      series,
      chart: {
        height: '300',
        type: "pie"
      },
      labels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: '100%'
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }
  barBultos(){

    let array1 = this.filascliente.map(fc=>Math.round(fc.bultos * 100) / 100);
    let array2 = this.filascliente.map(fc=>fc.nombre);

    let combined = array1.map((value, index) => [value, array2[index]]);
    combined.sort((a, b) => a[0] > b[0]?-1:1);

    let series = combined.map(pair => pair[0]);
    let labels = combined.map(pair => pair[1]);
    this.chartOptionsbul = {
      series,
      chart: {
        height: '300',
        type: "pie"
      },
      labels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: '100%'
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

}
