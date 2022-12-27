import { Component, OnInit } from "@angular/core";
import { NgForm, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { User } from "../../shared/models/user";
import { AuthService } from "../../shared/services/auth.service";

//add
import { ProductService } from "../../shared/services/product.service";
import * as firebase from "firebase/app";
import { Product } from "../../shared/models/product";
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireAuth } from "angularfire2/auth";
import { LoaderSpinnerService } from "../../shared/loader-spinner/loader-spinner";
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject
} from "angularfire2/database";
import { Cart } from "../../shared/models/cart";
import { Router } from "@angular/router";

@Component({
  selector: "app-userall-account",
  templateUrl: "./userall-account.component.html",
  styleUrls: ["./userall-account.component.scss"]
})
export class UserAllAccountComponent implements OnInit {
  loggedUser!: User;
  // Enable Update Button
infoUser:any;
detailUser:any;
infos:any;
infosList= [];
firedata = firebase.database().ref('/users');
productList!: Product[];
page = 1;
listusers: Cart[] = [];
myToggle= {};
data = {};
modal: NgbModalRef;
users;
nbrLike:any;
nbrNoLike:any;
nbrcomment:any;

  constructor(private authService: AuthService, private productService: ProductService, private firebaseAuth: AngularFireAuth,
              config: NgbModalConfig, private modalService: NgbModal, private spinnerService: LoaderSpinnerService,
              private db: AngularFireDatabase, private router: Router) {
    //this.infoUser = this.authService.userDetails.uid;
    config.backdrop = 'static';
    config.keyboard = false;
    //this.infoUser2 = this.productService.getUsers(this.infoUser)
    this.users = firebaseAuth.authState;
    this.users.subscribe((user:any) => {
      if (user) {
        this.infoUser = user.uid;

        console.log(user);
        const x = this.db.list('/users');
        console.log(x);
        x.snapshotChanges().subscribe((address:any) => {
          this.spinnerService.hide();
          this.listusers = [];
          address.forEach((element:any) => {
            const y = element.payload.toJSON();
            //y["$key"] = element.key;
            console.log(y["vendeur"]);
            if(y["vendeur"] == true){
              this.listusers.push(y as Cart);
            }
            console.log(this.listusers);
          });
        });

      } else {
        this.router.navigate(["/index/login"]);
      }
    });
  }

  ngOnInit() {
    this.loggedUser = this.authService.getLoggedInUser();
    this.getProductUser();
  }
//OUVRIR LE FORMULAIRE AJOUT ADRESSE LIVRAISON
  open(content:any, data:any) {
    if (data){
      console.log(data);
      this.data = data;
      this.modalService.open(content);
    }else{
      this.modalService.open(content);
    }

  }




  cancel(){
    location.reload(true);
    console.log("CANCEL");
  }

  getProductUser(){
    console.log(this.infoUser);
    const x = this.productService.getProductUser(this.infoUser);
    console.log(x);
    x.snapshotChanges().subscribe((pro:any) => {
      console.log(pro);
      this.productList = [];
      pro.forEach((element:any) => {
        const y = element.payload.toJSON();
        console.log(y);
        y["$key"] = element.key;
        console.log(y["$key"]);
        this.productList.push(y as Product);

       // this.productList.push(y["$key"]);
       console.log(this.productList);
      });
    });
  }


  //COMPTER TOUS LES NOMBRES

  paysFunction(pays:any){

    const u = this.productService.getUsers(this.infoUser);
    u.snapshotChanges().subscribe((use:any) => {
      use.forEach((element:any) => {
        const inf = element.payload.toJSON();
        this.infos = inf;
        if(pays == 'mon'){
          const x = this.db.list("/users", (ref:any) =>
          ref.orderByChild("country").equalTo(this.infos.country));
          x.snapshotChanges().subscribe((address:any) => {
            this.spinnerService.hide();
            this.listusers = [];
            address.forEach((element:any) => {
              const y = element.payload.toJSON();
              //y["$key"] = element.key;
              if(y["vendeur"] == true){
                this.listusers.push(y as Cart);
              }
            });
          });
        }else{
          this.spinnerService.show();
          const x = this.db.list('/users');
          x.snapshotChanges().subscribe((address:any) => {
            this.spinnerService.hide();
            this.listusers = [];
            address.forEach((element:any) => {
              const y = element.payload.toJSON();
              //y["$key"] = element.key;
              if(y["vendeur"] == true){
                this.listusers.push(y as Cart);
              }
            });
          });
        }
      });
    });

  }//fin fonction


}
