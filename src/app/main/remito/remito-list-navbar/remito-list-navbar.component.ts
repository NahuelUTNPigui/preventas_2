import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreConfigService } from '@core/services/config.service';

@Component({
  selector: 'app-remito-list-navbar',
  templateUrl: './remito-list-navbar.component.html',
  styleUrls: ['./remito-list-navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RemitoListNavbarComponent implements OnInit {
  // public
  public data: any;
  public tab = 1;

  /**
   * Constructor
   *add
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(private _coreConfigService: CoreConfigService,
     private _router: Router, private route: ActivatedRoute) {
  }


  onNavChange(event: any) {
    this.tab = event.nextId;
    this._router.navigate([], { relativeTo: this.route, queryParams: { tab: this.tab }, queryParamsHandling: 'merge' });
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   * 
   */
  ngOnInit(): void {
    this.tab = JSON.parse(this.route.snapshot.queryParamMap.get('tab'));
  }

}
