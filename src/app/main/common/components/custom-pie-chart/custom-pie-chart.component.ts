import { Component, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';

import {
  ApexChart,
  ApexStroke,
  ApexDataLabels,
  ApexXAxis,
  ApexTooltip,
  ApexPlotOptions,
  ApexYAxis,
  ApexFill,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexLegend,
  ApexResponsive,
  ApexStates
} from 'ng-apexcharts';

import { CoreConfigService } from '@core/services/config.service';

export interface ChartOptions {
  // Apex-non-axis-chart-series
  series?: ApexNonAxisChartSeries;
  chart?: ApexChart;
  stroke?: ApexStroke;
  tooltip?: ApexTooltip;
  dataLabels?: ApexDataLabels;
  fill?: ApexFill;
  colors?: string[];
  legend?: ApexLegend;
  labels?: any;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  markers?: ApexMarkers[];
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  states?: ApexStates;
}

@Component({
  selector: 'app-custom-pie-chart',
  templateUrl: './custom-pie-chart.component.html',
  styleUrls: ['./custom-pie-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomPieChartComponent implements OnInit {
  @ViewChild('apexDonutChartRef') apexDonutChartRef: any;
  @Input() data: any;  //title, series, labels

  // public
  public contentHeader: object;
  public apexDonutChart: Partial<ChartOptions>;
  public isMenuToggled = false;

  public radioModel = 1;

  // Color Variables
  chartColors = {
    column: {
      series1: '#826af9',
      series2: '#d2b0ff',
      bg: '#f8d3ff'
    },
    success: {
      shade_100: '#7eefc7',
      shade_200: '#06774f'
    },
    donut: {
      series1: '#ffe700',
      series2: '#00d4bd',
      series3: '#826bf8',
      series4: '#2b9bf4',
      series5: '#FFA1A1'
    },
    area: {
      series3: '#a4f8cd',
      series2: '#60f2ca',
      series1: '#2bdac7'
    }
  };


  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(private _coreConfigService: CoreConfigService) {
    // Apex Donut Chart

  }
  initializeChart = () => {
    const totalValue = this.data.series.reduce((acc, value) => acc + value, 0);
    if (this.data) {
      this.apexDonutChart = {
        series: this.data?.series ?? [0],
        chart: {
          height: 350,
          type: 'donut'
        },
        colors: [
          this.chartColors.donut.series1,
          this.chartColors.donut.series2,
          this.chartColors.donut.series3,
          this.chartColors.donut.series5
        ],
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  fontSize: '2rem',
                  fontFamily: 'Montserrat'
                },
                value: {
                  fontSize: '1rem',
                  fontFamily: 'Montserrat',
                  formatter: function (val) {
                    return val;
                  }
                },
                total: {
                  show: true,
                  fontSize: '1.5rem',
                  label: 'Total',
                  formatter: function (w) {
                    return totalValue;
                  }
                }
              }
            }
          }
        },
        legend: {
          show: true,
          position: 'bottom'
        },
        labels: this.data?.labels ?? ["No hay datos"],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 300
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        ]
      };
    }
  }
  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this.initializeChart();
  }

  /**
   * After View Init
   */
  ngAfterViewInit() {
    // Subscribe to core config changes
    this._coreConfigService.getConfig().subscribe(config => {
      // If Menu Collapsed Changes
      if (config.layout.menu.collapsed === true || config.layout.menu.collapsed === false) {
        setTimeout(() => {
          // Get Dynamic Width for Charts
          this.isMenuToggled = true;
          this.apexDonutChart.chart.width = this.apexDonutChartRef?.nativeElement.offsetWidth;
        }, 900);
      }
    });
  }
}
