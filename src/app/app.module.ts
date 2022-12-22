import { BrowserModule } from "@angular/platform-browser";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { IndexModule } from "./index/index.module";
import { ProductModule } from "./product/product.module";
import { UserModule } from "./user/user.module";
import { SharedModule } from "./shared/shared.module";
import { RouterModule } from "@angular/router";
import { AppRoutes } from "./app.routing";
//ajoute
import {NgbModule, NgbPaginationModule, NgbAlertModule} from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';
import {environment} from "../environments/environment";
import {GeoService} from "./geo.service";
import { ChatModule } from './chat/chat.module';
import { Ng5SliderModule } from "ng5-slider";
import { MDBBootstrapModule } from "angular-bootstrap-md";


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IndexModule,
    ProductModule,
    UserModule,
    SharedModule,
    NgbModule,
    NgbPaginationModule,
    NgbAlertModule,
    ChatModule,
    Ng5SliderModule,
    MDBBootstrapModule,
    RouterModule.forRoot(AppRoutes),
    AgmCoreModule.forRoot({
      //apiKey: environment.googleMapsKey
      apiKey: 'AIzaSyDMbxW3MlwUP2vrAZVJyu7pYqZa1LthvTE'
    })
  ],
  providers: [GeoService],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {}
