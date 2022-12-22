import { Component, OnInit } from "@angular/core";
import { Product } from "../../shared/models/product";
import { ProductService } from "../../shared/services/product.service";
//add
import { AuthService } from "../../shared/services/auth.service";
import * as firebase from "firebase/app";
import { LoaderSpinnerService } from "../../shared/loader-spinner/loader-spinner";
import { Cart } from "../../shared/models/cart";
import { AngularFireAuth } from "angularfire2/auth";
import { Observable } from "rxjs";

@Component({
  selector: "app-cart-products",
  templateUrl: "./cart-products.component.html",
  styleUrls: ["./cart-products.component.scss"]
})
export class CartProductsComponent implements OnInit {
  cartProducts: Cart[];
  showDataNotFound = true;
  firedata = firebase.database().ref('/cart');
  firedataMenu = firebase.database().ref('/menu');
  user: Observable<firebase.User>;
  userDetails: firebase.User = null;

  // Not Found Message
  messageTitle = "Vous n'avez pas de produit dans votre pannier";
  messageDescription = "Ajoutez des produits";

  constructor(private productService: ProductService, public authService: AuthService,
    private spinnerService: LoaderSpinnerService, private firebaseAuth: AngularFireAuth) {
    //this.user = this.authService.userDetails;
    this.user = firebaseAuth.authState;
  }

  ngOnInit() {
    this.getCartProduct();
  }

  removeCartProduct(product: Cart, key:any) {

    this.user.subscribe(user => {
      if (user) {
        this.userDetails = user;
        console.log(this.userDetails);
        this.productService.removeCart(key);
      } else {
        this.userDetails = null;
        this.productService.removeLocalCartProduct(product);
      }
    });

    // Recalling
    this.getCartProduct();
  }

  getCartProduct() {
    this.user.subscribe(user => {
      if (user) {
        this.userDetails = user;
        console.log(this.userDetails);
        console.log('sil est connecté on recupere le cart local pour charger enligne');

          const x = this.productService.getUsersCartProducts();
          console.log(x);
          x.snapshotChanges().subscribe((product:any) => {
            this.spinnerService.hide();
            this.cartProducts = [];
            product.forEach((element:any) => {
              const y = element.payload.toJSON();
              y["$key"] = element.key;
              this.cartProducts.push(y as Cart);
              console.log(this.cartProducts);
            });
          });

      } else {
        this.userDetails = null;
        console.log('on est dans le else');
        this.cartProducts = this.productService.getLocalCartProducts();
      }
    });
  }

  //incrementer
  increment(item_id:any){

    //check if item is exist in the cart or not
    if(this.userDetails){
      this.firedata.child(this.userDetails.uid).once('value', (snapshot:any) =>{
        if( snapshot.hasChild(item_id) == true ){

          var currentQty = snapshot.child(item_id).val().item_qty;
          //check if currentQty+1 is less than available stock

          //on doit dabord recuperer la qte de menu pour comparer et limiter le increment a cette qté
          this.firedataMenu.child(item_id).once('value', (snapshot:any)=>{
            if(snapshot.val()){
              console.log(snapshot.val().stock)
              var stock = snapshot.val().stock
              console.log(stock)
              if(currentQty < stock){
                //si ce kon veut augmenter est inferier a stock on incremente
                this.firedata.child(this.userDetails.uid).child(item_id).update({
                  item_qty : currentQty+1
                });
              }else{
                alert('vous avez déjà le maximum est stock')
              }

            }
          })


        }else{
          //pop error
          console.log('il ya eu une erreur');
        }
      });
    }else{
      alert('Vous devez vous connecter... Merci!')
    }


  }

  //on decremente
  decrement(item_id){

    //check if item is existt in the cart or not
    if(this.userDetails){
      this.firedata.child(this.userDetails.uid).once("value", (snapshot:any) =>{
        if( snapshot.hasChild(item_id) == true ){

          var currentQty = snapshot.child(item_id).val().item_qty;

          if( currentQty-1 <= 0){
            this.productService.removeCart(item_id);
          }else{
            this.firedata.child(this.userDetails.uid).child(item_id).update({
              item_qty : currentQty-1
            });
          }

        }else{
          //pop error
          console.log("erreur de decrement")
        }
      });
    }else{
      alert('Vous devez vous connecter... Merci!');

    }


  }


}
