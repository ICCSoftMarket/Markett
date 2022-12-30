import { Component, OnInit } from "@angular/core";
import { NgForm, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { User } from "../../shared/models/user";
import { AuthService } from "../../shared/services/auth.service";

//add
import firebase from 'firebase/compat/app';
import { ProductService } from "../../shared/services/product.service";
// import * as firebase from "firebase/app";
import { Product } from "../../shared/models/product";
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireAuth } from "angularfire2/auth";
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject
} from "angularfire2/database";
import { LoaderSpinnerService } from "../../shared/loader-spinner/loader-spinner";
import { Cart } from "../../shared/models/cart";
import { FileItem } from '../../shared/directives/file-item';
import { GeoService } from '../../geo.service';
import { ToastOptions, ToastyService, ToastyConfig } from "ng2-toasty";
import * as CanvasJS from '../../canvasjs.min';

@Component({
  selector: "app-user-account",
  templateUrl: "./user-account.component.html",
  styleUrls: ["./user-account.component.scss"]
})
export class UserAccountComponent implements OnInit {
  loggedUser!: User;
  // Enable Update Button
infoUser;
detailUser:any;
infos:any;
infosList= [];
firedata = firebase.database().ref('/users');
productList!: Product[];
page = 1;
lisAddress: Cart[] = [];
myToggle= {};
data = {};
modal!: NgbModalRef;
users;
supp = {};
selectedFiles!: FileList;
currentUpload!: FileItem;
url = '';
bg:any;
latUser!: number;
lngUser!: number;
firedataVente = firebase.database().ref('/vente');
nbrVente:any;
nbrAchat:any;
tabVente: any[] = [];
tabAchat: any[] = [];

  constructor(private authService: AuthService, private productService: ProductService, private firebaseAuth: AngularFireAuth,
              config: NgbModalConfig, private modalService: NgbModal, private db: AngularFireDatabase, private spinnerService: LoaderSpinnerService,
              private geo: GeoService,private toastyService: ToastyService, private toastyConfig: ToastyConfig) {
    this.infoUser = this.authService.userDetails.uid;
    config.backdrop = 'static';
    config.keyboard = false;
    //this.infoUser2 = this.productService.getUsers(this.infoUser)

    this.users = firebaseAuth.authState;
    this.users.subscribe((user:any) => {
      if (user) {
        //this.infoUser = user;

        //console.log(this.infoUser);
        const x = this.db.list('/users/'+ user.uid + '/address');
        console.log(x);
        x.snapshotChanges().subscribe((address:any) => {
          this.spinnerService.hide();
          this.lisAddress = [];
          address.forEach((element:any) => {
            const y = element.payload.toJSON();
            y["$key"] = element.key;
            this.lisAddress.push(y as Cart);
            console.log(this.lisAddress);
          });
        });

      } else {
        //this.infoUser = null;
      }
    });

  }

  ngOnInit() {
    this.loggedUser = this.authService.getLoggedInUser();
    this.getInfoUser();
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

  //OUVRIR LE CREER TEMPLATE ADRESSE LIVRAISON
  openCreer(contentCreer:any) {
    this.modalService.open(contentCreer);

}
//AJOUTER UNE ADRESSE DE LIVRAISON
adressLivraison(addressForm: NgForm, data:any) {
  const dataform = addressForm.value;
  console.log(data);
  if(data){
    this.firedata.child(this.infoUser).child("address").child(data.$key).update({
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
      return ""
    }else{
      this.firedata.child(this.infoUser).child("address").push({
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
    title: "Adresse de livraison",
    msg: "Une adresse de livraison a été ajouté",
    showClose: true,
    timeout: 3000,
    theme: "material"
  };
  this.toastyService.success(toastOption);

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
    //    this.lisAddress = [];
    //    console.log(this.infos);
    //    for (var key in this.infos.address){
    //      console.log(key);
    //      console.log(this.infos.address[key]);
    //      this.lisAddress.push(this.infos.address[key]);
    //      console.log(this.lisAddress);
    //    }
      });
    });

//compte les ventes
      this.nbrVente = 0;
      console.log(this.infoUser)
      this.firedataVente.child(this.infoUser).once('value', (snapshot:any) =>{
        this.tabVente = [];
        if(snapshot.val()){
          for (var i in snapshot.val()){
            this.tabVente.push(snapshot.val()[i])
        }
        console.log('deja vendu'+ this.tabVente.length +'produits')
        this.nbrVente = this.tabVente.length;
        }else{
          console.log('pas de vente')
          this.nbrVente = 0;
        }
        this.financeGrapg();
      })
      console.log(this.nbrVente)


      //POUR LES ACHATS
      this.firedataVente.child(this.infoUser).orderByChild("uid_client").equalTo(this.infoUser).once('value', (snapshot:any) =>{
        this.tabAchat = [];
        console.log(snapshot.val());
        if(snapshot.val()){
          for (var i in snapshot.val()){
            this.tabAchat.push(snapshot.val()[i])
          }
          console.log('deja achete '+ this.tabAchat.length +'produits')
          this.nbrAchat = this.tabAchat.length;
        }else{
          console.log('pas de vente')
          this.nbrAchat = 0;
        }
        this.financeGrapgAchat();
      })
      console.log(this.nbrAchat)


  }

  //FONCTION DU TOGGLE
  showMessage(value:any) {
    console.log(value);
    if (value == 'false') {
      this.firedata.child(this.infoUser).update({   // set
        vendeur: true
      });
     } // if it has been checked NOW ...
    if (value == 'true') {
      this.firedata.child(this.infoUser).update({   // set
        vendeur: false
      });
     } // if it has been unchecked NOW ...
}

  updateUser(userForm: NgForm) {
    this.authService
    this.firedata.child(this.infoUser).update({
      country: userForm.value["country"],
      telephone: userForm.value["telephone"],
      ville: userForm.value["ville"],
      quartier: userForm.value["quartier"]
    });
    const toastOption: ToastOptions = {
      title: "Mise a jour",
      msg: "vos informations ont été mise à jour",
      showClose: true,
      timeout: 2000,
      theme: "material"
    };
    this.toastyService.wait(toastOption);
  }

  cancel(){
    // @ts-ignore
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

  //CHANGER LE TOGGLE
  togleChange(){
    this.firedata.child(this.infoUser).once('value', (snapshot:any) =>{
      console.log(snapshot.val().vendeur);
      var toggle = snapshot.val().vendeur;

      if (toggle == false) {
        this.firedata.child(this.infoUser).update({    // set
          vendeur: true
        });
        const toastOption: ToastOptions = {
          title: "Modification effectuée",
          msg: "vous etes à nouveau vendeur",
          showClose: true,
          timeout: 3000,
          theme: "material"
        };
        this.toastyService.success(toastOption);
       }else {
        this.firedata.child(this.infoUser).update({    // set
          vendeur: false
        });
        const toastOption: ToastOptions = {
          title: "Modification effectuée",
          msg: "vous n'etes plus vendeur",
          showClose: true,
          timeout: 3000,
          theme: "material"
        };
        this.toastyService.success(toastOption);
       }

    })

  }
  // CONFIRMEZ AVANT DE SUPPRIMER UNE ADRESSE LIVRAISON
  openSm(contentSupp:any, item:any) {
    this.supp = item;
    this.modalService.open(contentSupp, { size: 'sm' });
  }

  supprimAddressLivraison(supp:any){
    console.log(supp);
    console.log(supp.$key);
    this.firedata.child(this.infoUser).child("address").child(supp.$key).remove();
    const toastOption: ToastOptions = {
      title: "Suppression de l'adresse",
      msg: "adresse a été supprimé",
      showClose: true,
      timeout: 3000,
      theme: "material"
    };
    this.toastyService.success(toastOption);
    this.modalService.dismissAll();
  }


  //ONJOUTER UNE IMAGE DE PROFILE

  openImage(contentImage:any, bg:any) {
    console.log(bg);
    this.bg = bg;
    this.modalService.open(contentImage, this.bg);
  }


  onFileChanged(event:any) {
    const file = event.target.files;
    console.log(event);
    console.log(file);
    this.selectedFiles = file;
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.url = event.target.result;
        console.log(this.url);
      }
    }
  }

  uploadImage(bg:any){
    console.log(bg);
    let file = this.selectedFiles.item(0)
    // @ts-ignore
    this.currentUpload = new FileItem(file);
    this.pushUpload(this.currentUpload, bg);
    const toastOption: ToastOptions = {
      title: "Envoi de l'image",
      msg: "veuillez patienter svp",
      showClose: true,
      timeout: 2000,
      theme: "material"
    };
    this.toastyService.wait(toastOption);
  }

  pushUpload(upload: FileItem, bg:any) {
    console.log(bg);
    let storageRef = firebase.storage().ref();
    let uploadTask = storageRef.child('profiles/'+ upload.file.name).put(upload.file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot:any) =>  {
        // upload in progress
        upload.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100
      },
      (error:any) => {
        // upload failed
        console.log(error)
      },
      () => {
        // upload success
        upload.url = uploadTask.snapshot.downloadURL
        upload.name = upload.file.name
        console.log(upload.name)
        this.saveFileData(upload, upload.url, upload.name, bg)
      }
    );
  }

  private saveFileData(image:any, url:any, name:any, bg:any) {
    console.log(bg);

    if(bg == 'bg'){
      //on supprime lancienne photo de bg
      this.firedata.child(this.infoUser).once('value', (snapshot:any)=>{
        console.log(snapshot.val().name_img_bg)
        if(snapshot.val().name_img_bg){
          this.deleteFileStorageProfile(snapshot.val().name_img_bg);
        }
      })

      this.firedata.child(this.infoUser).update({
        image_bg: url,
        name_img_bg: name
      })
    }else{
      //on supprime lancienne photo de profile
      this.firedata.child(this.infoUser).once('value', (snapshot:any)=>{
        console.log(snapshot.val().name_img)
        if(snapshot.val().name_img){
          this.deleteFileStorageProfile(snapshot.val().name_img);
        }
      })

      this.firedata.child(this.infoUser).update({
        image_profile: url,
        name_img: name
      })
    }

    this.modalService.dismissAll();
   }


   //melocaliser
   meLocaliser(){
    if (navigator.geolocation) {
      var description = this.infos.description || '';
      navigator.geolocation.getCurrentPosition(position => {
       this.latUser = position.coords.latitude;
       this.lngUser = position.coords.longitude;
       this.geo.setLocation(this.infoUser, [this.latUser, this.lngUser], this.infos.image_profile, this.infos.name, this.infos.telephone, description);

       const toastOption: ToastOptions = {
        title: "localisation",
        msg: "votre position a été Ajouté avec le succes",
        showClose: true,
        timeout: 3000,
        theme: "material"
      };
      this.toastyService.success(toastOption);

      });

    }


  }


  //suppression du produit
  removeProduct(key: string, name:any) {
    this.productService.deleteProduct(key);
    this.deleteFileStorage(name);
  }

  //SUPPRIMER IMAGE DU PRODUIT
  private deleteFileStorage(name:string) {
    let storageRef = firebase.storage().ref();
    storageRef.child('images/'+ name ).delete()
  }
  //SUPPRIMER IMAGE DU PROFILE
  private deleteFileStorageProfile(name:string) {
    let storageRef = firebase.storage().ref();
    storageRef.child('profiles/'+ name ).delete()
  }


  //tabs function
  openCity(evt:any, cityName:any) {
    // Declare all variables
    console.log(evt);
    console.log(cityName);
    var i, tabcontent, tablinks;
    //document.getElementById("defaultOpen").click();
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName)!.style.display = "block";
    evt.currentTarget.className += " active";
  }


  //tchat bot
  openForm() {
    document.getElementById("myForm")!.style.display = "block";
  }

  closeForm() {
    document.getElementById("myForm")!.style.display = "none";
  }



  //ANALYSE FINANCIER DES VENTES
  financeGrapg() {
    console.log(this.tabVente)
    var tablo = [];
    for (var i in this.tabVente) {
      console.log(this.tabVente[i].product_name)
      console.log(this.tabVente[i].product_name)
      var a = {y: this.tabVente[i].nbre_vente, name: this.tabVente[i].product_name}
      tablo.push(a);
    }
    let chart = new CanvasJS.Chart("chartContainer", {
      theme: "light2",
      animationEnabled: true,
      exportEnabled: true,
      title:{
        text: "Rapport des ventes par produit"
      },

      data: [{
        type: "pie",
        showInLegend: true,
        toolTipContent: "<b>{name}</b>: n°{y} (#percent%)",
        indexLabel: "{name} - #percent%",

        dataPoints: tablo
      }]
    });

    chart.render();
  }//fin grapg


  //ANALYSE FINANCIER DES ACHATS
  financeGrapgAchat() {
    console.log(this.tabAchat)
    var tablo = [];
    for (var i in this.tabAchat) {
      console.log(this.tabAchat[i].product_name)
      console.log(this.tabAchat[i].product_name)
      var a = {y: this.tabAchat[i].nbre_vente, name: this.tabAchat[i].product_name}
      tablo.push(a);
    }
    let chart = new CanvasJS.Chart("chartContainerAchat", {
      theme: "light2",
      animationEnabled: true,
      exportEnabled: true,
      title:{
        text: "Rapport de vos achats"
      },

      data: [{
        type: "pie",
        showInLegend: true,
        toolTipContent: "<b>{name}</b>: n°{y} (#percent%)",
        indexLabel: "{name} - #percent%",

        dataPoints: tablo
      }]
    });

    chart.render();
  }//fin grapg

}
