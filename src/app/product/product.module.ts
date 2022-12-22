// Core Dependencies
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

// configuration and services
import { ProductRoutes } from "./product.routing";

// Components
import { CheckoutModule } from "./checkout/checkout.module";

import { ProductComponent } from "./product.component";
import { BestProductComponent } from "./best-product/best-product.component";
// import { ProductListComponent } from "./product-list/product-list.component";
import { AddProductComponent } from "./add-product/add-product.component";
import { ProductDetailComponent } from "./product-detail/product-detail.component";
import { SharedModule } from "../shared/shared.module";
import { FavouriteProductsComponent } from "./favourite-products/favourite-products.component";
import { CartProductsComponent } from "./cart-products/cart-products.component";
import { CartCalculatorComponent } from "./cart-calculator/cart-calculator.component";

//add
import { enchereListComponent } from "./enchere-list/enchere-list.component";
import { GoogleMapComponent } from "../google-map/google-map.component";
import { UserAllAccountComponent } from "../user/userall-account/userall-account.component";
import { UserIdAccountComponent } from "../user/userid-account/userid-account.component";
// import { Ng5SliderModule } from "ng5-slider";
import { ProductListComponent } from "./product-list/product-list.component";
import { ProductListComponentCateg } from "./product-list-categ/product-list.component-categ";
// import { MDBBootstrapModule } from "angular-bootstrap-md";
import {ImageZoomModule} from 'angular2-image-zoom';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ProductRoutes),
    SharedModule,
    CheckoutModule,
    // Ng5SliderModule,
    // MDBBootstrapModule.
    ImageZoomModule
  ],
  declarations: [
    ProductComponent,
    BestProductComponent,
    ProductListComponent,
    AddProductComponent,
    ProductListComponentCateg,
    
    ProductDetailComponent,
    FavouriteProductsComponent,
    CartProductsComponent,
    CartCalculatorComponent,
    enchereListComponent,
    GoogleMapComponent,
    UserAllAccountComponent,
    UserIdAccountComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  exports: [BestProductComponent]
})
export class ProductModule {}
