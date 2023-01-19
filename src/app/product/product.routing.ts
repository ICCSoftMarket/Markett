import { CheckoutComponent } from "./checkout/checkout.component";
import { CartProductsComponent } from "./cart-products/cart-products.component";
import { FavouriteProductsComponent } from "./favourite-products/favourite-products.component";
// import { ProductListComponent } from "./product-list/product-list.component";
import { Routes } from "@angular/router";
import { IndexComponent } from "../index/index.component";
import { ProductDetailComponent } from "./product-detail/product-detail.component";

//add
import { enchereListComponent } from "./enchere-list/enchere-list.component";
import { AddProductComponent } from "./add-product/add-product.component";
import { UserAllAccountComponent } from "../user/userall-account/userall-account.component";
import { UserIdAccountComponent } from "../user/userid-account/userid-account.component";
import { GoogleMapComponent } from "../google-map/google-map.component";
import { ProductListComponent } from "./product-list/product-list.component";
import { ProductListComponentCateg } from "./product-list-categ/product-list.component-categ";

// @ts-ignore
export const ProductRoutes: Routes = [
  {
    path: "products",
    children: [
      {
        path: "",
        component: IndexComponent
      },
      {
        path: "all-products",
        component: ProductListComponent
      },
      {
        path: "categ-products/:categ",
        component: ProductListComponentCateg
      },
      {
        path: "add-product",
        component: AddProductComponent
      },
      {
        path: "favourite-products",
        component: FavouriteProductsComponent
      },
      {
        path: "cart-items",
        component: CartProductsComponent
      },
      {
        path: "checkouts",
        // loadChildren: "./checkout/checkout.module#CheckoutModule"
      },
      {
        path: "product/:id",
        component: ProductDetailComponent
      },
      {
        path: "all-enchere",
        component: enchereListComponent
      },
      {
        path: "userall",
        component: UserAllAccountComponent
      },
      {
        path: "userid/:id",
        component: UserIdAccountComponent
      },
      {
        path: "map",
        component: GoogleMapComponent
      }
    ]
  }
];
