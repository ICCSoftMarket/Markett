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
  selector: "app-order-account",
  templateUrl: "./order-account.component.html",
  styleUrls: ["./order-account.component.scss"]
})
export class OrderAccountComponent implements OnInit {
  loggedUser!: User;
  // Enable Update Button
infoUser;
detailUser:any;
infos:any;
infosList= [];
firedata = firebase.database().ref('/users');
firedataOrder = firebase.database().ref('/orders');
firedataMenu = firebase.database().ref('/menu');
firedataEchere = firebase.database().ref('/enchere');
firedataVente = firebase.database().ref('/vente');
orderList!: Product[];
page = 1;
lisAddress: any[] = [];
myToggle= {};
data = {};
modal: NgbModalRef;


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
    this.getProductOrderClient();
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


  getInfoUser(){
    console.log(this.infoUser);
    const x = this.productService.getUsers(this.infoUser);
    console.log(x);
    x.snapshotChanges().subscribe((use:any) => {
      console.log(use);
      use.forEach((element:any) => {
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


  getProductOrderClient(){
    console.log(this.infoUser);
    const x = this.productService.getProductOrderClient(this.infoUser);
    console.log(x);
    x.snapshotChanges().subscribe((pro:any) => {
      console.log(pro);
      this.orderList = [];
      pro.forEach((element:any) => {
        const y = element.payload.toJSON();
        console.log(y);
        y["$key"] = element.key;
        console.log(y["$key"]);
        this.orderList.push(y as Product);

       // this.productList.push(y["$key"]);
       console.log(this.orderList);


      });
    });
  }


  vendu(product:any){
    console.log(product);
    this.firedataMenu.child(product.product_id).once('value', (snapshot:any)=>{
      console.log(snapshot.val());

      console.log('si le produit existe dans le menu');
      if(snapshot.val()){
        console.log('sil existe dans le menu');
          console.log(snapshot.val().stock);
          var nbre = snapshot.val().stock - product.item_qty
          console.log(nbre);

          if(nbre > 0){
            this.firedataMenu.child(product.product_id).update({
              stock: nbre
            });
            this.firedataOrder.child(product.$key).remove();
          }else{
            console.log('sinon retir le produit');
            this.firedataMenu.child(product.product_id).remove();
            this.firedataOrder.child(product.$key).remove();
            this.deleteFileStorage(product.name_img);
          }
        }else{
          console.log('sil nexiste pas je vais le chercher dans les encheres')
          this.firedataOrder.child(product.$key).remove();
          this.deleteFileStorage(product.name_img);
        }

      })

      this.firedataVente.child(this.infoUser).orderByChild("product_name").equalTo(product.product_name).once('value', (snapshot:any)=>{
        if(snapshot.val()){
          //sil a déjà vendu ce produit on modifie la quantité juste
          this.firedataVente.child(this.infoUser).child(product.product_id).update({
            nbre_vente: snapshot.val().nbre_vente + product.item_qty,
            date: new Date().toISOString(),
            client: product.user_acheteur,
            uid_client: product.user_id,
            idvendeur: product.idvendeur,
            product_name: product.product_name,
            product_price: product.product_price,
            phonevendeur: product.phonevendeur,
            phoneclient: product.user_phone,
            vendeur: product.nomvendeur
          });
          //on garde linfo de celui qui a achete
          this.firedataVente.child(this.infoUser).child(product.product_id).push({
            nbre_vente: product.item_qty,
            date: new Date().toISOString(),
            client: product.user_acheteur,
            uid_client: product.user_id,
            idvendeur: product.idvendeur,
            product_name: product.product_name,
            product_price: product.product_price,
            phonevendeur: product.phonevendeur,
            phoneclient: product.user_phone,
            vendeur: product.nomvendeur
          });
        }else{
          //si la vente nexiste pas encore on la cree
          this.firedataVente.child(this.infoUser).child(product.product_id).set({
            nbre_vente: product.item_qty,
            date: new Date().toISOString(),
            client: product.user_acheteur,
            uid_client: product.user_id,
            idvendeur: product.idvendeur,
            product_name: product.product_name,
            product_price: product.product_price,
            phonevendeur: product.phonevendeur,
            phoneclient: product.user_phone,
            vendeur: product.nomvendeur
          });
          //on garde linfo de celui qui a achete
          this.firedataVente.child(this.infoUser).child(product.product_id).push({
            nbre_vente: product.item_qty,
            date: new Date().toISOString(),
            client: product.user_acheteur,
            uid_client: product.user_id,
            idvendeur: product.idvendeur,
            product_name: product.product_name,
            product_price: product.product_price,
            phonevendeur: product.phonevendeur,
            phoneclient: product.user_phone,
            vendeur: product.nomvendeur
          });
        }
      })
  }

   //SUPPRIMER UN PRODUIT
  private deleteFileStorage(name:string) {
    let storageRef = firebase.storage().ref();
    storageRef.child('images/'+ name ).delete()
  }

}
