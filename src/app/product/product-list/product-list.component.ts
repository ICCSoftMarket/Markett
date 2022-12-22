import { Component, OnInit } from "@angular/core";
import { Product } from "../../shared/models/product";
import { AuthService } from "../../shared/services/auth.service";
import { ProductService } from "../../shared/services/product.service";
import { LoaderSpinnerService } from "../../shared/loader-spinner/loader-spinner";

//add
import * as firebase from "firebase/app";
import { Observable } from "rxjs";
import { AngularFireAuth } from "angularfire2/auth";
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject
} from "angularfire2/database";
import { NgForm, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Cart } from "../../shared/models/cart";
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router";
import { LabelType, Options } from "ng5-slider";

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"]
})
export class ProductListComponent implements OnInit {
  productList: Product[];
  categoryList= [];
  segment: string = 'vetement_homme';
  selectedSegment: string = this.segment;
  firedata = firebase.database().ref('/category');

  brands = ["All", "Google", "Apple", "Samsung", "OnePlus", "Lenovo", "Nokia", "Motorolla"];

  selectedBrand: "All";
  selectedPays: "All"
  searchText;
  userConnect;
  user: Observable<firebase.User>;

  page = 1;

  nbrLike;
  listLike = [];
  nbrNoLike;
  listNoLike = [];
  dejaLike;
  dejaNoLike;
  listComment = [];
  nbrcomment;
  infoUser;
  firedataMenu = firebase.database().ref('/menu');
  infos;
  selectedTab = 0;

  searchAmount;
  searchAmountmin;
  paysList= [];

  slides: any = [[]];
  chunk(arr, chunkSize) {
    let R = [];
    for (let i = 0, len = arr.length; i < len; i += chunkSize) {
      R.push(arr.slice(i, i + chunkSize));
    }
    console.log("le R est ", R)
    return R;
  }

  constructor(
    public authService: AuthService, private productService: ProductService, private spinnerService: LoaderSpinnerService,
    private firebaseAuth: AngularFireAuth, private db: AngularFireDatabase, private modalService: NgbModal,private router: Router
  ) {
    this.user = firebaseAuth.authState;
    this.user.subscribe(user => {
      if (user) {
        this.userConnect = user.uid;
        this.infoUser = user;
        this.getInfoUser();
      } else {
        this.userConnect = null;
      }
    });
  }

  ngOnInit() {
    this.getAllProducts();
    //this.getAllCategory();
    this.getCateg();
    this.getAllPays()

    console.log('navig', navigator.geolocation);
    
  }

  getAllProducts() {
    this.spinnerService.show();
    const x = this.productService.getProducts();
    console.log(x);
    x.snapshotChanges().subscribe(product => {
      this.spinnerService.hide();
      this.productList = [];
      product.forEach(element => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.productList.push(y as Product);
        console.log(this.productList);
      });
    });
  }

  getCateg(){
    this.firedata.once('value', (snapshot) =>{
      
      for (var categ in snapshot.val()){
        this.categoryList.push(snapshot.val()[categ])
      }
      // console.log(this.categoryList);
      this.slides = this.chunk(this.categoryList, 6);
    })
  }

  //recherche des pays
  getAllPays() {
    const x = this.productService.getPays();
    x.snapshotChanges().subscribe(categ => {
      categ.forEach(element => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        // console.log("yyy", y)
        this.paysList.push(y);
      });
    });
  }

  removeProduct(key: string, name) {
    this.productService.deleteProduct(key);
    this.deleteFileStorage(name);
  }

  //SUPPRIMER UN PRODUIT
  private deleteFileStorage(name:string) {
    let storageRef = firebase.storage().ref();
    storageRef.child('images/'+ name ).delete()
  }

  addFavourite(product: Product) {
    this.productService.addFavouriteProduct(product);
  }

  addToCart(product: Product) {
    this.productService.addToCart(product, '');
  }


  brandFunction(brand){
    this.selectedBrand = brand;
    console.log(this.selectedBrand);
  }

  // paysFunction(pays){
  //   console.log(this.infos)
  //   console.log(this.infos.country)
  //   console.log(pays)
  //   if(pays == 'mon'){
  //     const x = this.productService.getProducByCountry(this.infos.country);
  //     x.snapshotChanges().subscribe(pro => {
  //       this.productList = [];
  //       pro.forEach(element => {
  //         const y = element.payload.toJSON();
  //         y["$key"] = element.key;
  //         console.log(y["$key"]);
  //         this.productList.push(y as Product);
  //       });
  //     });
  //   }else{
  //     this.spinnerService.show();
  //     const x = this.productService.getProducts();
  //     console.log(x);
  //     x.snapshotChanges().subscribe(product => {
  //       this.spinnerService.hide();
  //       this.productList = [];
  //       product.forEach(element => {
  //         const y = element.payload.toJSON();
  //         y["$key"] = element.key;
  //         this.productList.push(y as Product);
  //         console.log(this.productList);
  //       });
  //     });
  //   }
  // }

  paysFunction(pays){
    console.log("mon log pays", pays)
    if(!pays){
      this.spinnerService.show();
        const x = this.productService.getProducts();
        // console.log(x);
        x.snapshotChanges().subscribe(product => {
          this.spinnerService.hide();
          this.productList = [];
          product.forEach(element => {
            const y = element.payload.toJSON();
            y["$key"] = element.key;
            this.productList.push(y as Product);
            // console.log(this.productList);
          });
        });
    }else{
      this.spinnerService.show();
      const x = this.productService.getProducByCountry(pays);
      x.snapshotChanges().subscribe(pro => {
        this.spinnerService.hide();
        this.productList = [];
        pro.forEach(element => {
          const y = element.payload.toJSON();
          y["$key"] = element.key;
          // console.log(y["$key"]);
          this.productList.push(y as Product);
        });
      });
    }
      
    
  }



    //*******************DONNEZ DES LIKE */
like(product){
  console.log(product);
  
  this.firedataMenu.child(product.$key).child('like').orderByChild('uid').equalTo(this.infoUser.uid).once('value', (snapshot)=>{
      console.log(snapshot.val());
      if (snapshot.val()){
        console.log('il a déjà voté');
      }else{
        console.log('pas');
        this.firedataMenu.child(product.$key).child('like').push({
          uid: this.infoUser.uid,
          name: this.infoUser.displayName,
          dejavote: true
        
        });
      }
    })
  }
  
  nobreVote(key){
    this.nbrLike = 0;
    const x = this.db.list('/menu/'+ key + '/like');
    console.log(x);
    x.snapshotChanges().subscribe(prod => {
      this.spinnerService.hide();
      console.log(prod);
      this.listLike = [];
      prod.forEach(element => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.listLike.push(y as Cart);
        this.nbrLike = this.listLike.length;
        this.dejaLike = y["dejavote"];
      });
    });
  }
  //********************DONNEZ DES NOLIKE */
  noLike(product){
    console.log(product);
    
    this.firedataMenu.child(product.$key).child('nolike').orderByChild('uid').equalTo(this.infoUser.uid).once('value', (snapshot)=>{
        console.log(snapshot.val());
        if (snapshot.val()){
          console.log('il a déjà no voté');
        }else{
          console.log('pas');
          this.firedataMenu.child(this.infoUser).child('nolike').push({
            uid: this.infoUser.uid,
            name: this.infoUser.displayName,
            dejanovote: true
          
          });
        }
      })
    }
    
    nobreNoVote(key){
      this.nbrNoLike = 0;
      const x = this.db.list('/menu/'+ key + '/nolike');
      console.log(x);
      x.snapshotChanges().subscribe(prod => {
        this.spinnerService.hide();
        this.listNoLike = [];
        prod.forEach(element => {
          const y = element.payload.toJSON();
          y["$key"] = element.key;
          this.listNoLike.push(y as Cart);
          this.nbrNoLike = this.listNoLike.length;
          this.dejaNoLike = y["dejanovote"];
        });
      });
      return this.nbrNoLike
    }
  
  //*****************AJOUT DE COMMENTAIRE */
  
  //OUVRIR LE FORMULAIRE AJOUT ADRESSE LIVRAISON
    open(content, key) {
      this.modalService.open(content);
      
    }
  
  
  //AJOUTER UN COMMENTAIRE
  addCommentaire(commentForm: NgForm, key) {
    const dataform = commentForm.value;
    console.log(dataform);
    
    this.firedataMenu.child(key).child('comment').orderByChild('uid').equalTo(this.infoUser.uid).once('value', (snapshot)=>{
      console.log(snapshot.val());
      console.log(this.infos.image_profile);
      
        console.log('pas');
        this.firedata.child(this.infoUser).child('comment').push({
          uid: this.infoUser.uid,
          name: this.infoUser.displayName,
          comment: dataform.commentaire,
          image: this.infos.image_profile
        
        });
      
    })
      
      this.modalService.dismissAll();
    
    }
  
    //COMPTER LE NOMBRE DE COMMENTAIRES
    nobreComment(key){
      this.nbrcomment = 0;
      const x = this.db.list('/menu/'+ key + '/comment');
      console.log(x);
      x.snapshotChanges().subscribe(prod => {
        this.spinnerService.hide();
        this.listComment = [];
        prod.forEach(element => {
          const y = element.payload.toJSON();
          y["$key"] = element.key;
          this.listComment.push(y as Cart);
          this.nbrcomment = this.listComment.length;
        });
      });
      return this.nbrcomment
    }

    //  infos du user connecte
    getInfoUser(){
      console.log(this.infoUser.uid);
      const x = this.productService.getUsers(this.infoUser.uid);
      console.log(x);
      x.snapshotChanges().subscribe(use => {
        console.log(use);
        use.forEach(element => {
          const inf = element.payload.toJSON();
          console.log(inf);
          this.infos = inf;
        });
      });
    }



    // next() {
    //   if (this.selectedTab < this.categoryList.length) {
    //     this.selectedTab++;
    //     this.router.navigate(this.categoryList[this.selectedTab].link);
    //   }
    // }
  
    // back() {
    //   if (this.selectedTab > 0) {
    //     this.selectedTab--;
    //     this.router.navigate(this.categoryList[this.selectedTab].link);
    //   }
    // }

    // ouvrepagecateg(categ){
    //   this.router.navigate(['/products/categ-products/', categ]);
    // }


}
