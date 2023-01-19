import { UserDetail, User } from "./../../../shared/models/user";
import { AuthService } from "./../../../shared/services/auth.service";
import { Component, OnInit } from "@angular/core";
import { NgForm } from "../../../../../node_modules/@angular/forms";
import firebase from 'firebase/compat/app';

//add
import { AngularFireAuth } from "angularfire2/auth";
import { Router } from "@angular/router";
import { ProductService } from "./../../../shared/services/product.service";
import { LoaderSpinnerService } from "../../../shared/loader-spinner/loader-spinner";
import { Cart } from "../../../shared/models/cart";
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject
} from "angularfire2/database";
import { ToastOptions, ToastyService, ToastyConfig } from "ng2-toasty";

@Component({
  selector: "app-shipping-details",
  templateUrl: "./shipping-details.component.html",
  styleUrls: ["./shipping-details.component.scss"]
})
export class ShippingDetailsComponent implements OnInit {
  userDetails: User;
  addresses:any;
  firedata = firebase.database().ref('/users');
  users;
  addressList: Cart[] = [];
  prodCart: Cart[] = [];
  firedataOrder = firebase.database().ref('/orders');
  firedataVente = firebase.database().ref('/vente');
  firedataCart = firebase.database().ref('/cart');
  userinfos:any;
  data:UserDetail= new UserDetail();
  supp = {};
  closeResult!: string;

  userDetail: UserDetail;

  constructor(private authService: AuthService, private firebaseAuth: AngularFireAuth, private router: Router,
    private productService: ProductService, private spinnerService: LoaderSpinnerService, private db: AngularFireDatabase,
    config: NgbModalConfig, private modalService: NgbModal,private toastyService: ToastyService, private toastyConfig: ToastyConfig) {
    this.userDetail = new UserDetail();
    this.userDetails = authService.getLoggedInUser();
    config.backdrop = 'static';
    config.keyboard = false;

    this.users = firebaseAuth.authState;
    this.users.subscribe((user:any) => {
      if (user) {
        this.userDetails = user;
        this.userinfos = user;
        console.log(this.userDetails);
    //    this.firedata.child(user.uid).child("address").once('value', (snapshot) =>{
    //      console.log(snapshot.val());
    //      for (var addr in snapshot.val()){
    //        this.addressList.push(snapshot.val()[addr])
    //      }
    //      console.log(this.addressList);
    //    })

        const x = this.db.list('/users/'+ user.uid + '/address');
        console.log(x);
        x.snapshotChanges().subscribe((address:any) => {
          this.spinnerService.hide();
          this.addressList = [];
          address.forEach((element:any) => {
            const y = element.payload.toJSON();
            y["$key"] = element.key;
            this.addressList.push(y as Cart);
            console.log(this.addressList);
          });
        });

      } else {
        this.userDetails;
      }
    });
  }

  ngOnInit() {}

  getValue(item:any){
    this.addresses = item;
    console.log(this.addresses);
    }

  updateUserDetails(form: NgForm) {
    const data = form.value;
    console.log(this.addresses);
    //data["emailId"] = this.userDetails.emailId;
    //data["userName"] = this.userDetails.userName;
    //this.router.navigate(['/checkouts', {outlets: {'checkOutlet': ['billing-details']}}], this.addresses);

    const x = this.productService.getUsersCartProducts();
    console.log(x);
    x.snapshotChanges().subscribe((product:any) => {
      this.spinnerService.hide();
      this.prodCart = [];
      product.forEach((element:any) => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.prodCart.push(y as Cart);
        console.log(this.prodCart);
      });
      console.log(this.prodCart);
      console.log(this.addresses);

    if(this.addresses.length == 0){
      //Check if the checkboxes are selected ?
      //sharedUtils.showAlert("Error","Vous devez choisir une adresse de livraison et un mode de payement.")
      alert('vous devez selectionner une adresse de livraison!');
    }
    else if (this.prodCart.length === 0){
         // sharedUtils.showAlert("Error","Vous devez dabord ajouter les produits dans votre panier puis les commander.")
         alert("vous n'avez pas de produit dans votre pannier!");
    }else{
      // @ts-ignore
      console.log(this.addresses["phone"]);
      var address = {
        ville: this.addresses["address"],
        quartier: this.addresses["quartier"],
        name: this.userinfos.displayName,
        pin: this.addresses["pin"],
        phone: this.addresses["phone"]
      }

      for (var i = 0; i < this.prodCart.length; i++) {
      //Add cart item to order table
      console.log(this.prodCart[i]);
      console.log(this.addresses);
      console.log(this.userinfos);

      this.firedataOrder.push({

        //Product data is hardcoded for simplicity

        product_name: this.prodCart[i].item_name,
        product_price: this.prodCart[i].item_price,
        product_image: this.prodCart[i].item_image,
        product_id: this.prodCart[i].$key,
        idvendeur: this.prodCart[i].item_vendeur,
        nomvendeur: this.prodCart[i].item_nomvendeur,
        phonevendeur: this.prodCart[i].item_phonevendeur,
        name_img: this.prodCart[i].name_img,

        //item data
        item_qty: this.prodCart[i].item_qty,

        //Order data
        user_id:        this.userinfos.uid,
        user_name:      this.userinfos.displayName,
        user_acheteur:  this.userinfos.displayName,
        user_phone:     this.addresses["phone"],
        user_quartier:  this.addresses["quartier"],
        user_ville:  this.addresses["address"],
        user_pin:  this.addresses["pin"],
        address_id: address,
        payment_id: 'COD',
        date_commande: new Date().toISOString(),
        status: "En attente"

      });

      console.log(this.prodCart[i].item_vendeur);
      console.log(this.prodCart[i].length);
      console.log(this.prodCart[i].item_qty);
      //this.firedataVente.child(this.prodCart[i].item_vendeur).push({
      //    nbre_vente: this.prodCart[i].item_qty,
      //    date: new Date().toISOString(),
      //    clent: this.userinfos.displayName,
      //    uid_client: this.userinfos.uid,
      //    idvendeur: this.prodCart[i].item_vendeur
      //  });
      //en fin on supprime le cart
      this.firedataCart.child(this.userinfos.uid).remove();
    }
    const toastOption: ToastOptions = {
      title: "Création de la commande",
      msg: "la commande a été généré ",
      showClose: true,
      timeout: 3000,
      theme: "material"
    };
    this.toastyService.success(toastOption);
    this.router.navigate(['/checkouts', {outlets: {'checkOutlet': ['billing-details']}}]);
    }

  });

  }

  //OUVRIR LE FORMULAIRE MODIF ADRESSE LIVRAISON
  open(content:any, data:any) {
    console.log(data);
    if (data){
      console.log(data);
      this.data = data;
      this.modalService.open(content, data);
    }else{
      console.log("c'est le simple");
      this.modalService.open(content);
    }

  }
  //OUVRIR LE CREER TEMPLATE ADRESSE LIVRAISON
  openCreer(contentCreer:any) {
      this.modalService.open(contentCreer);

  }

  //AJOUTER UNE ADRESSE DE LIVRAISON
adressLivraison(addressForm: NgForm, data:any) {
  console.log(data);
  const dataform = addressForm.value;

  if(data){
    console.log(data.$key);
    this.firedata.child(this.userinfos.uid).child("address").child(data.$key).update({
      nickname: addressForm.value["nickname"],
      phone: addressForm.value["phone"],
      address: addressForm.value["address"],
      quartier: addressForm.value["quartier"],
      pin: addressForm.value["pin"],
    });
    this.modalService.dismissAll();
  }else{
    if(dataform.nickname== undefined || dataform.phone== undefined || dataform.address== undefined || dataform.quartier== undefined || dataform.pin== undefined){
      alert("Un champs n'est pas saisie!");
      this.data = dataform;
    }else{

      this.firedata.child(this.userinfos.uid).child("address").push({
        nickname: addressForm.value["nickname"],
        phone: addressForm.value["phone"],
        address: addressForm.value["address"],
        quartier: addressForm.value["quartier"],
        pin: addressForm.value["pin"],
      });
    }

    this.modalService.dismissAll();
  }
  const toastOption: ToastOptions = {
    title: "ajout",
    msg: " l'adresse a été ajouté ",
    showClose: true,
    timeout: 3000,
    theme: "material"
  };
  this.toastyService.success(toastOption);
  this.modalService.dismissAll();
  }

  // CONFIRMEZ AVANT DE SUPPRIMER UNE ADRESSE LIVRAISON
  openSm(contentSupp:any, item:any) {
    this.supp = item;
    this.modalService.open(contentSupp, { size: 'sm' });
  }

  supprimAddressLivraison(supp:any){
    console.log(supp);
    console.log(supp.$key);
    this.firedata.child(this.userinfos.uid).child("address").child(supp.$key).remove();
    const toastOption: ToastOptions = {
      title: "suppression",
      msg: "l'adresse a été supprimé",
      showClose: true,
      timeout: 3000,
      theme: "material"
    };
    this.toastyService.success(toastOption);
    this.modalService.dismissAll();
  }
}
