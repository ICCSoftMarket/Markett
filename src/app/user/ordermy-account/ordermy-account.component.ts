import { Component, OnInit } from "@angular/core";
import { NgForm, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { User } from "../../shared/models/user";
import { AuthService } from "../../shared/services/auth.service";

//add
import { ProductService } from "../../shared/services/product.service";
import * as firebase from "firebase/app";
import { Product } from "../../shared/models/product";
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: "app-ordermy-account",
  templateUrl: "./ordermy-account.component.html",
  styleUrls: ["./ordermy-account.component.scss"]
})
export class OrderMyAccountComponent implements OnInit {
  loggedUser: User;
  // Enable Update Button
infoUser;
detailUser;
infos;
infosList= [];
firedata = firebase.database().ref('/users');
firedataOrder = firebase.database().ref('/orders');
firedataMenu = firebase.database().ref('/menu');
orderListMy: Product[];
page = 1;
lisAddress= [];
myToggle= {};
data = {};
modal: NgbModalRef;
text;

  constructor(private authService: AuthService, private productService: ProductService,
              config: NgbModalConfig, private modalService: NgbModal) {
    this.infoUser = this.authService.userDetails.uid;
    config.backdrop = 'static';
    config.keyboard = false;
    //this.infoUser2 = this.productService.getUsers(this.infoUser)
  }

  ngOnInit() {
    this.loggedUser = this.authService.getLoggedInUser();
    this.getInfoUser();
    this.getProductOrderMy();
  }
//OUVRIR LE FORMULAIRE AJOUT ADRESSE LIVRAISON
  open(content) {

      this.modalService.open(content);

    
  }


  getInfoUser(){
    console.log(this.infoUser);
    const x = this.productService.getUsers(this.infoUser);
    console.log(x);
    x.snapshotChanges().subscribe(use => {
      console.log(use);
      use.forEach(element => {
        const inf = element.payload.toJSON();
        console.log(inf);
        this.infos = inf;

        // TOGGLE
        var toggle = this.infos.vendeur;
        this.myToggle = { checked: toggle };
        //y["$key"] = element.key;
        //this.paysList.push(y);
        //ADRESSE DE LIVRAISON
        this.lisAddress = [];
        console.log(this.infos);
        for (var key in this.infos.address){
          console.log(key);
          console.log(this.infos.address[key]);
          this.lisAddress.push(this.infos.address[key]);
          console.log(this.lisAddress);
        }
      });
    });
  }


  getProductOrderMy(){
    console.log(this.infoUser);
    const x = this.productService.getProductOrderMy(this.infoUser);
    console.log(x);
    x.snapshotChanges().subscribe(pro => {
      console.log(pro);
      this.orderListMy = [];
      pro.forEach(element => {
        const y = element.payload.toJSON();
        console.log(y);
        y["$key"] = element.key;
        console.log(y["$key"]);
        this.orderListMy.push(y as Product);

       // this.productList.push(y["$key"]);
       console.log(this.orderListMy);

       //verifie si le produit est encore dispo
       this.firedataMenu.once('value', (snapshot)=>{
         console.log(snapshot.val())
        if(snapshot.hasChild(y["product_id"]) == true){
          
         this.text = 1;
         console.log(this.text)
         this.firedataOrder.child(y["$key"]).update({
           encore : 1
         })
        }else{
          
          this.text = 0;
          console.log(this.text)
          this.firedataOrder.child(y["$key"]).update({
            encore : 0
          })
        }
      })

      });
    });
  }


  retour(produit){
    this.firedataOrder.child(produit.$key).remove();
    }

}
