import { Component, OnInit } from "@angular/core";
import { Product } from "../../shared/models/product";
import { ProductService } from "../../shared/services/product.service";

//add
import { Observable } from "rxjs";
import * as firebase from "firebase/app";
import { AngularFireAuth } from "angularfire2/auth";

@Component({
  selector: "app-favourite-products",
  templateUrl: "./favourite-products.component.html",
  styleUrls: ["./favourite-products.component.scss"]
})
export class FavouriteProductsComponent implements OnInit {
  favoruiteProducts: Product[];
  showDataNotFound = true;
  user: Observable<firebase.User>;
  infoUser;

  // Not Found Message
  messageTitle = "Vous n'avez pas de produit favori";
  messageDescription = "Svp, choisissez des produits favoris";

  constructor(private productService: ProductService, private firebaseAuth: AngularFireAuth) {

    this.user = firebaseAuth.authState;
    this.user.subscribe(user => {
      if (user) {
        this.infoUser = user.uid;
        console.log(this.infoUser);
      } else {
        this.infoUser = null;
      }
    });
  }

  ngOnInit() {
    this.getFavouriteProduct();
  }
  removeFavourite(product: Product) {
    this.productService.removeLocalFavourite(product);

    this.getFavouriteProduct();
  }

  getFavouriteProduct() {
    this.favoruiteProducts = this.productService.getLocalFavouriteProducts();
    console.log(this.favoruiteProducts)
  }

  addToCart(product: Product) {
    this.productService.addToCart(product, '');
  }
}
