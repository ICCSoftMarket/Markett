import { Injectable } from "@angular/core";
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject
} from "angularfire2/database";
import { ToastOptions, ToastyService, ToastyConfig } from "ng2-toasty";
import { Product } from "../models/product";
import { AuthService } from "./auth.service";

//import ajouté
import { LoaderSpinnerService } from "../../shared/loader-spinner/loader-spinner";
import { Cart } from "../models/cart";
import { AngularFireAuth } from "angularfire2/auth";
import { Observable } from "rxjs";
import * as firebase from "firebase/app";

@Injectable()
export class ProductService {
  products: AngularFireList<Product>;
  encheres: AngularFireList<Product>;
  encheresid: AngularFireList<Product>;
  product: AngularFireObject<Product>;
  addLocal: AngularFireObject<Product>;
  category: AngularFireList<Product>;
  pays: AngularFireList<Product>;
  productList: Product[];
  users: AngularFireList<Product>;
  productuser: AngularFireList<Product>;
  productcateg: AngularFireList<Product>;
  productorder: AngularFireList<Product>;
  productordermy: AngularFireList<Product>;
  firedata = firebase.database().ref('/cart');

  // favouriteProducts
  favouriteProducts: AngularFireList<FavouriteProduct>;
  cartProducts: AngularFireList<FavouriteProduct>;

  // NavbarCounts
  navbarCartCount = 0;
  navbarFavProdCount = 0;
  user: Observable<firebase.User>;
  userDetails: firebase.User = null;
  key:any;
  encherespays:any;
  encherescateg:any;

  constructor(
    private db: AngularFireDatabase, private authService: AuthService,
    private toastyService: ToastyService, private toastyConfig: ToastyConfig,
    private spinnerService: LoaderSpinnerService, private firebaseAuth: AngularFireAuth
  ) {
    // Toaster Config
    this.toastyConfig.position = "top-right";
    this.toastyConfig.theme = "material";

  //  if (this.authService.isLoggedIn()) {
  //    this.calculateFavProductCounts();
  //    this.calculateCartProductCounts();
  //  } else {
  //    this.calculateLocalFavProdCounts();
  //    this.calculateLocalCartProdCounts();
  //  }

    this.user = firebaseAuth.authState;
    this.user.subscribe(user => {
      if (user) {
        this.userDetails = user;
        console.log(this.userDetails);
        //this.calculateFavProductCounts();
        this.calculateLocalFavProdCounts();
        this.calculateCartProductCounts();
      } else {
        this.userDetails = null;
        this.calculateLocalFavProdCounts();
        this.calculateLocalCartProdCounts();
      }
    });
  }

  getProducts() {
    this.products = this.db.list("/menu");
    return this.products;
  }

//avoir les categories
  getCategories() {
    this.category = this.db.list("/category");
    return this.category;
  }

//avoir les pays
  getPays() {
    this.pays = this.db.list("/featured");
    return this.pays;
  }

//avoir les infos du user
  getUsers(userUid:any) {
    this.users = this.db.list("users", (ref:any) =>
    ref.orderByChild("uid").equalTo(userUid));
    console.log(this.users);
    return this.users;
  }

//avoir les produits dun user
  getProductUser(userUid:any) {
    this.productuser = this.db.list("menu", (ref:any) =>
    ref.orderByChild("idvendeur").equalTo(userUid));
    console.log(this.productuser);
    return this.productuser;
  }

  //avoir les produits dun pays
  getProducByCountry(country:any) {
    this.productuser = this.db.list("menu", (ref:any) =>
    ref.orderByChild("country").equalTo(country));
    console.log(this.productuser);
    return this.productuser;
  }

  //avoir les produits dune categorie
  getProducByCateg(categ:any) {
    this.productcateg = this.db.list("menu", (ref:any) =>
    ref.orderByChild("category").equalTo(categ));
    // console.log(this.productuser);
    return this.productcateg;
  }
/***************************COMMANDES************************************ */
//avoir les commandes de mes clients
  getProductOrderClient(userUid:any) {
    this.productorder = this.db.list("orders", (ref:any) =>
    ref.orderByChild("idvendeur").equalTo(userUid));
    console.log(this.productorder);
    return this.productorder;
  }

  //avoir mes commandes
  getProductOrderMy(userUid:any) {
    this.productordermy = this.db.list("orders", (ref:any) =>
    ref.orderByChild("user_id").equalTo(userUid));
    console.log(this.productordermy);
    return this.productordermy;
  }
/***********************ENCHERE*********************************************** */

getEcheres() {
  this.encheres = this.db.list("/enchere");
  return this.encheres;
}
// Get une enchère
getEnchereId(montant:any, id:any) {
  this.encheresid = this.db.list("/enchere", (ref:any) =>
    ref.child(id).child("offres").orderByChild("montant_enchere").equalTo(montant));
    console.log(this.encheresid);
  return this.encheresid;
}

// Get enchères par pays
getEnchereByPays(pays:any) {
  this.encherespays = this.db.list("/enchere", (ref:any) =>
    ref.orderByChild("country").equalTo(pays));
    console.log(this.encherespays);
  return this.encherespays;
}

  createProduct(data: Product) {
    this.products.push(data);
  }

  getProductById(key: string) {
    this.product = this.db.object("menu/" + key);
    return this.product;
  }

  getEnchereById(key: string) {
    this.product = this.db.object("enchere/" + key);
    return this.product;
  }

  getEnchereByCateg(categ:any) {
    this.encherescateg = this.db.list("/enchere", (ref:any) =>
    ref.orderByChild("category").equalTo(categ));
    // console.log(this.encherespays);
  return this.encherescateg;
  }

  updateProduct(data: Product) {
    this.products.update(data.$key, data);
  }

  deleteProduct(key: string) {
    this.products.remove(key);
  }

  /*
   ----------  Favourite Product Function  ----------
  */

  // Get Favourite Product based on userId
  getUsersFavouriteProduct() {
    const user = this.authService.getLoggedInUser();
    this.favouriteProducts = this.db.list("favouriteProducts", (ref:any) =>
      ref.orderByChild("userId").equalTo(user.$key)
    );
    return this.favouriteProducts;
  }

  // Adding New product to favourite if logged else to localStorage
  addFavouriteProduct(data: Product): void {
    console.log(data);
    // Toast Product Already exists
    const toastAlreadyExists: ToastOptions = {
      title: "Ce produit sera ajouté à vos favoris",
      msg: "Votre produit a été ajouté dans la liste des favoris",
      showClose: true,
      timeout: 5000,
      theme: "material"
    };

    // Toaster Adding
    const toastAdd: ToastOptions = {
      title: "Produit ajouté",
      msg: "Ajout du pruduit aux Favoris",
      showClose: true,
      timeout: 5000,
      theme: "material"
    };

    let a: Product[];
    a = JSON.parse(localStorage.getItem("avf_item")) || [];
    console.log(a);
    a.push(data);
    this.toastyService.wait(toastAdd);
    setTimeout(() => {
      localStorage.setItem("avf_item", JSON.stringify(a));
      this.calculateLocalFavProdCounts();
    }, 1500);
  }

  // Fetching unsigned users favourite proucts
  getLocalFavouriteProducts(): Product[] {
    const products: Product[] =
      JSON.parse(localStorage.getItem("avf_item")) || [];

    return products;
  }

  // Removing Favourite Product from Database
  removeFavourite(key: string) {
    this.favouriteProducts.remove(key);
  }

  // Removing Favourite Product from localStorage
  removeLocalFavourite(product: Product) {
    const products: Product[] = JSON.parse(localStorage.getItem("avf_item"));

    for (let i = 0; i < products.length; i++) {
      if (products[i].$key === product.$key) {
        products.splice(i, 1);
        break;
      }
    }
    // ReAdding the products after remove
    localStorage.setItem("avf_item", JSON.stringify(products));

    this.calculateLocalFavProdCounts();
  }

  // Returning Local Products Count
  calculateLocalFavProdCounts() {
    this.navbarFavProdCount = this.getLocalFavouriteProducts().length;
  }

  // Calculating FavProductsCount and storing it in variable
  calculateFavProductCounts() {
    const x = this.getUsersFavouriteProduct()
      .snapshotChanges()
      .subscribe((data:any) => {
        this.navbarFavProdCount = data.length;
      });
  }

  /*
   ----------  Cart Product Function  ----------
  */

  // Fetching Cart Products based on userId
  getUsersCartProducts() {
    const user = this.authService.getLoggedInUser();
    this.cartProducts = this.db.list("cart", (ref:any) =>
      //ref.orderByChild("idacheteur").equalTo(user.$key)
      ref.child(user.$key)
    );
    return this.cartProducts;
  }

  // Adding new Product to cart db if logged in else localStorage
  addToCart(data: Product, id: any): void {
    console.log(data)
    let a: Cart[];
    console.log(data.$key)
    let addLocal: Cart ={
      $key: data.$key,
      item_name: data.name,
      item_image: data.image,
      item_price: data.price,
      item_vendeur: data.idvendeur,
      item_nomvendeur: data.nomvendeur,
      item_phonevendeur: data.phone_vendeur,
      name_img: data.name_img,
      item_qty: 1
    }
    //a = JSON.parse(localStorage.getItem("avct_item")) || []; avct_item

    //a.push(addLocal);

    //this.user.subscribe(user => {
      console.log(this.userDetails);
      if (this.userDetails != null) {
        //this.userDetails = user;
        console.log(this.userDetails.uid);

          this.firedata.child(this.userDetails.uid).child(data.$key).once("value", (snapshot:any) => {
            console.log('ici on est dans le once');
            console.log(snapshot);
            console.log(snapshot.val());

            if( snapshot.val()){
              console.log('le produit existe deja on incremente juste')
              //if item is already in the cart
              var currentQty = snapshot.val().item_qty;
              console.log(currentQty)
              this.firedata.child(this.userDetails.uid).child(data.$key).update({   // update
                          item_qty : currentQty+1
              });
            }else{
              console.log(data);
              this.firedata.child(this.userDetails.uid).child(data.$key).set({
                item_name: data.name,
                item_image: data.image,
                item_price: data.price,
                item_vendeur: data.idvendeur,
                item_nomvendeur: data.nomvendeur,
                item_phonevendeur: data.phone_vendeur,
                name_img: data.name_img,
                item_qty: 1
                });
              }
            });
         // }
        const toastOption: ToastOptions = {
          title: "Ajouté à votre panier",
          msg: "Produit ajouté au panier",
          showClose: true,
          timeout: 1000,
          theme: "material"
        };
        this.toastyService.wait(toastOption);
        setTimeout(() => {
          //localStorage.setItem("cartsss_item", JSON.stringify(a));
          this.calculateCartProductCounts();
        }, 500);

      } else {
        console.log('on est pas connecté')
        this.userDetails = null;
        console.log(localStorage)
        a = JSON.parse(localStorage.getItem("cartssss_item")) || [];
        console.log(a);
        a.push(addLocal);



        const toastOption: ToastOptions = {
          title: "Ajouté à votre panier",
          msg: "Produit ajouté au panier",
          showClose: true,
          timeout: 1000,
          theme: "material"
        };
        this.toastyService.wait(toastOption);
        setTimeout(() => {
          localStorage.setItem("cartssss_item", JSON.stringify(a));
          this.calculateLocalCartProdCounts();
        }, 500);
      }
   // });


  }

  // Removing Cart product from db
  removeCart(key: string) {
    this.cartProducts.remove(key);
  }

  // Removing cart from local
  removeLocalCartProduct(product: Cart) {
    const products: Cart[] = JSON.parse(localStorage.getItem("cartssss_item"));

    for (let i = 0; i < products.length; i++) {
      if (products[i].$key === product.$key) {
        products.splice(i, 1);
        break;
      }
    }
    // ReAdding the products after remove
    console.log('essai de retirer le cart local')
    localStorage.setItem("cartssss_item", JSON.stringify(products));

    this.calculateLocalCartProdCounts();
  }

  // Fetching Locat CartsProducts
  getLocalCartProducts(): Cart[] {
    console.log(localStorage.getItem('cartssss_item'));

    if(localStorage.getItem('cartssss_item')){
      const products: Cart[] =
      JSON.parse(localStorage.getItem("cartssss_item")) || [];
      return products;
    }else{
      const products: Cart[] = [];
      return products;
    }
  }

  // returning LocalCarts Product Count
  calculateLocalCartProdCounts() {
    this.navbarCartCount = this.getLocalCartProducts().length;
  }

  // Calculating Cart products count and assigning to variable
  calculateCartProductCounts() {
    console.log('on fait le calcul du nbre de produit enligne gggggggg')

    const x = this.getUsersCartProducts().snapshotChanges()
      .subscribe((data:any) => {
        console.log(data)
        this.navbarCartCount = data.length;
      });
  }


  updateCartOnligne(){
    //on retire dabord les produits en local les mettre en ligne
    var prodCart = this.getLocalCartProducts();
    console.log(prodCart);
    if (prodCart.length > 0 || prodCart != null){
      var n = 0;
      for (var i=0; i < prodCart.length; i ++){
        console.log(prodCart[i].$key);
        this.key = prodCart[i].$key;

            console.log(this.key);
            this.firedata.child(this.userDetails.uid).child(this.key).once('value', (snapshotCart:any)=>{
              console.log('tout n°' + n);
              if(!snapshotCart.val() && n <= (prodCart.length -1)){
                console.log('on ajouter un prod panier' + n);
                this.firedata.child(this.userDetails.uid).child(this.key).set({
                  item_name: prodCart[i].item_name,
                  item_image: prodCart[i].item_image,
                  item_price: prodCart[i].item_price,
                  item_vendeur: prodCart[i].item_vendeur,
                  item_nomvendeur: prodCart[i].item_nomvendeur,
                  item_phonevendeur: prodCart[i].item_phonevendeur,
                  name_img: prodCart[i].name_img,
                  item_qty: 1
                });
              }else if (snapshotCart.val() && n <= (prodCart.length - 1)){
                //si le produit existe
                console.log('ce produit existe' + snapshotCart.val());
                console.log('cest le meme que' + prodCart[i]);
                var currentQty = snapshotCart.val().item_qty;
                console.log('currenQty = ' + currentQty);
                console.log('qty en local = ' + prodCart[i].item_qty);
                this.firedata.child(this.userDetails.uid).child(this.key).update({
                  item_qty: currentQty + prodCart[i].item_qty
                })
              }

            })
            console.log('produit local' + prodCart[i].item_name + 'du tour n°' + n)
            this.removeLocalCartProduct(prodCart[i])

         n+=1;
      }
    }else{
      console.log('il nya pas de produit en local')
    }
  }//fin fonction

  //AJOUT DES PRODUITS PAR CATEGORIE plus utilisé
  getCategVetHom() {
    this.spinnerService.show();
    const x = this.db.list("menu", (ref:any) =>
    ref.orderByChild("category").equalTo("vetement_homme"));
    x.snapshotChanges().subscribe((product:any) => {
      this.spinnerService.hide();
      this.productList = [];
      product.forEach((element:any) => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.productList.push(y as Product);
      });
    });
    return this.productList;
  }
}

export class FavouriteProduct {
  product: Product;
  productId: string;
  userId: string;
}
