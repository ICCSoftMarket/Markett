import { UserComponent } from "./user/user.component";
import { Routes, RouterModule } from "@angular/router";
import { IndexComponent } from "./index/index.component";
import { UserAccountComponent } from "./user/user-account/user-account.component";
import { NoAccessComponent } from "./shared/components/no-access/no-access.component";
import { PageNotFoundComponent } from "./shared/components/page-not-found/page-not-found.component";

export const AppRoutes: Routes = [
  {
    path: "",
    component: IndexComponent,
    children: [
      {
        path: "index",
        // loadChildren: "./index/index.module#IndexModule"
        // loadChildren: () => import('./index/index.module').then(m => m.IndexModule)
      },
      {
        path: "products",
        // loadChildren: "./product/product.module#ProductModule"
        // loadChildren: () => import('./product/product.module').then(m => m.ProductModule)
      },
      {
        path: "users",
        // loadChildren: "./user/user.module#UserModule"
      }
    ]
  },
  { path: "no-access", component: NoAccessComponent },
  { path: "**", component: PageNotFoundComponent }
];
