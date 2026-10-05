import { Component, OnInit,Input,ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexChart,
  ApexAxisChartSeries,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexFill,
  ApexYAxis,
  ApexXAxis,
  ApexTooltip,
  ApexMarkers,
  ApexAnnotations,
  ApexStroke
} from "ng-apexcharts";


export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  annotations: ApexAnnotations;
  colors: any;
  toolbar: any;
};
@Component({
  selector: 'app-modalreporte',
  templateUrl: './modalreporte.component.html',
  styleUrls: ['./modalreporte.component.scss']
})
export class ModalreporteComponent implements OnInit {

  @Input() remitos =[]
  
  @Input() fechaDesde = ""
  @Input() fechaHasta = ""

  @ViewChild("evoeco", { static: false }) evoeco: ChartComponent;
  @ViewChild("evokil", { static: false }) evokil: ChartComponent;
  @ViewChild("evobul", { static: false }) evobul: ChartComponent;

  public remitosProcesados = []
  public ecochartOptions: Partial<ChartOptions>;
  public kilchartOptions: Partial<ChartOptions>;
  public bulchartOptions: Partial<ChartOptions>;
  public activeOptionButton = "all";
  
  
  constructor() { }

  ngOnInit(): void {
    let contadoreco = {}
    for(let i = 0;i<this.remitos.length;i++){
      if(contadoreco[this.remitos[i].fechaIngreso]){
        contadoreco[this.remitos[i].fechaIngreso].total += this.redondear(this.remitos[i].totalViaje)
        contadoreco[this.remitos[i].fechaIngreso].kilos += this.redondear(this.remitos[i].kilos)
        contadoreco[this.remitos[i].fechaIngreso].bultos += this.redondear(this.remitos[i].bultos)
      }
      else{
        contadoreco[this.remitos[i].fechaIngreso] ={
          fecha:new Date(this.remitos[i].fechaIngreso).getTime(),
          total : this.redondear(this.remitos[i].totalViaje),
          kilos : this.redondear(this.remitos[i].kilos),
          bultos : this.redondear(this.remitos[i].bultos)
        } 
      }
    }
    this.remitosProcesados = []
    Object.entries(contadoreco).forEach(([key, value]) => {
      this.remitosProcesados.push(value)
    });
    this.remitosProcesados.sort((a,b)=>a.fecha<b.fecha?-1:1)
    
    this.initChartEco()
    this.initChartKil()
    this.initChartBul()
  }
  redondear(x){
    return Math.round(x*100)/100
  }
  initChartEco(): void {
    //let ecodata = this.remitos.map(r=>[new Date(r.fechaIngreso).getTime(),r.totalViaje])
    let ecodata:[number,number][] = this.remitosProcesados.map(r=>[r.fecha,this.redondear(r.total)])
    
    this.ecochartOptions   = {
      series: [
        {
          data: ecodata
        }
      ],
      chart: {
        type: "line",
        height: 350
      },
      
      dataLabels: {
        enabled: false
      },
      xaxis: {
        type: "datetime",
        min: new Date(this.fechaDesde).getTime(),
        max: new Date(this.fechaHasta).getTime(),
        tickAmount: 6
      },
      tooltip: {
        x: {
          format: "dd/MM/yyyy"
        },
        y:{
          title: {
            formatter: (seriesName) => "",
          },
        }
      },
      markers: {
        size: 1,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      }
    };
  }
  initChartKil(): void {
    //let ecodata = this.remitos.map(r=>[new Date(r.fechaIngreso).getTime(),r.totalViaje])
    let kildata:[number,number][] = this.remitosProcesados.map(r=>[r.fecha,this.redondear(r.kilos)])
    
    this.kilchartOptions   = {
      series: [
        {
          data: kildata
        }
      ],
      chart: {
        type: "line",
        height: 350
      },
      
      dataLabels: {
        enabled: false
      },
      xaxis: {
        type: "datetime",
        min: new Date(this.fechaDesde).getTime(),
        max: new Date(this.fechaHasta).getTime(),
        tickAmount: 6
      },
      tooltip: {
        x: {
          format: "dd/MM/yyyy"
        },
        y:{
          title: {
            formatter: (seriesName) => "",
          },
        }
      },
      markers: {
        size: 1,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      },
      colors:["#d4526e"]
    };
  }
  initChartBul(): void {
    //let ecodata = this.remitos.map(r=>[new Date(r.fechaIngreso).getTime(),r.totalViaje])
    let buldata:[number,number][] = this.remitosProcesados.map(r=>[r.fecha,this.redondear(r.bultos)])
    
    this.bulchartOptions   = {
      series: [
        {
          data: buldata
        }
      ],
      chart: {
        type: "line",
        height: 350
      },

      dataLabels: {
        enabled: false
      },
      xaxis: {
        type: "datetime",
        min: new Date(this.fechaDesde).getTime(),
        max: new Date(this.fechaHasta).getTime(),
        tickAmount: 6
      },
      tooltip: {
        x: {
          format: "dd/MM/yyyy"
        },
        y:{
          title: {
            formatter: (seriesName) => "",
          },
        }
      },
      markers: {
        size: 1,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      },
      colors:["#E4D00A"]
    };
  }


}
