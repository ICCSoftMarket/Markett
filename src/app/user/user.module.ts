// Core Dependencies
import { RouterModule } from "@angular/router";
import {
  NgModule,
  NO_ERRORS_SCHEMA,
  CUSTOM_ELEMENTS_SCHEMA
} from "@angular/core";
import { CommonModule } from "@angular/common";


// Configuration and Services
import { UserRoutes } from "./user.routing";

// Components
import { UserComponent } from "./user.component";
import { UserAccountComponent } from "./user-account/user-account.component";
import { SharedModule } from "../shared/shared.module";

//add
import { OrderAccountComponent } from "./order-account/order-account.component";
import { OrderMyAccountComponent } from "./ordermy-account/ordermy-account.component";


@NgModule({
  imports: [CommonModule, SharedModule, RouterModule.forChild(UserRoutes)],
  declarations: [UserComponent, UserAccountComponent, OrderAccountComponent, OrderMyAccountComponent],
  providers: [],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class UserModule {}
