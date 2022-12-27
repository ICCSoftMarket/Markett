import { ProductService } from "./../../../shared/services/product.service";
import { Component, OnInit } from "@angular/core";
import { Product } from "../../../shared/models/product";

//add
import { Cart } from "../../../shared/models/cart";
import { AngularFireAuth } from "angularfire2/auth";
import { Observable } from "rxjs";
import * as firebase from "firebase/app";
import { LoaderSpinnerService } from "../../../shared/loader-spinner/loader-spinner";
import { Router } from "@angular/router";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.scss"]
})
export class ProductsComponent implements OnInit {
  //checkoutProducts: Product[];
  checkoutProducts!: Cart[];

  totalPrice = 0;
  user: Observable<firebase.User>;
  userDetails: firebase.User = null;
  constructor(private productService: ProductService, private firebaseAuth: AngularFireAuth,
    private spinnerService: LoaderSpinnerService, private router: Router) {

    this.user = firebaseAuth.authState;
    this.user.subscribe(user => {
      if (user) {
        this.userDetails = user;
        console.log(this.userDetails);

        const x = this.productService.getUsersCartProducts();
        console.log(x);
        x.snapshotChanges().subscribe((product:any) => {
          this.spinnerService.hide();
          this.checkoutProducts = [];
          product.forEach((element:any) => {
            const y = element.payload.toJSON();
            this.totalPrice += (y["item_price"]*y["item_qty"])
            console.log(this.totalPrice);
            y["$key"] = element.key;
            this.checkoutProducts.push(y as Cart);
            console.log(this.checkoutProducts);
          });
        });


      } else {
        this.userDetails = null;
        this.router.navigate(["/index/login"]);
      }
    });
    //const products = productService.getLocalCartProducts();

    //this.checkoutProducts = products;

    //products.forEach(product => {
    //  console.log("Checkout", product.productPrice);
    //  this.totalPrice += product["price"];
    //});
  }

  ngOnInit() {}
}
