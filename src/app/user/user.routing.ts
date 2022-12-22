import { UserComponent } from "./user.component";
import { UserAccountComponent } from "./user-account/user-account.component";
import { Routes, RouterModule } from "@angular/router";

//add
import { OrderAccountComponent } from "./order-account/order-account.component";
import { OrderMyAccountComponent } from "./ordermy-account/ordermy-account.component";

export const UserRoutes: Routes = [
  {
    path: "users",
    component: UserComponent,
    children: [
      {
        path: "",
        component: UserAccountComponent,
        outlet: "profileOutlet"
      },
      {
        path: "order",
        component: OrderAccountComponent,
        outlet: "profileOutlet"
      },
      {
        path: "ordermy",
        component: OrderMyAccountComponent,
        outlet: "profileOutlet"
      }
    ]
  }
];
