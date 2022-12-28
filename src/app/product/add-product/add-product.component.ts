import {
  ToastyService,
  ToastyConfig,
  ToastOptions,
  ToastData
} from 'ng2-toasty';
import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Product } from "../../shared/models/product";
import { ProductService } from "../../shared/services/product.service";
import firebase from 'firebase/compat/app';

//add
import { FileItem } from '../../shared/directives/file-item';
import 'firebase/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from "@angular/router";

declare var $: any;
declare var require: any;
const shortId = require("shortid");
const moment = require("moment");

@Component({
  selector: "app-add-product",
  templateUrl: "./add-product.component.html",
  styleUrls: ["./add-product.component.scss"]
})
export class AddProductComponent implements OnInit {
  product: Product = new Product();
  categList: any[] = [];
  firedata = firebase.database().ref('/category');
  firedataMenu = firebase.database().ref('/menu');
  firedataEnchere = firebase.database().ref('/enchere');
  firedataUser = firebase.database().ref('/users');

  isDropZoneOver:boolean = false;
  isEnabledUpload: boolean = true;
  url = '';
  url2 = '';
  url3 = '';
  urls = [];
  private IMAGES_FOLDER: string = 'images';
  files: Array<FileItem[]> = [];
  selectedFiles!: FileList;
  currentUpload!: FileItem;
  userInfos:any;
  zone:any;
  phone:any;
  ville:any;
  quartier:any;
  reduct2:any;
  tmp:any;
  discut:any;
  user;
  obligatoire:any;
  name:any;
  tab = [];


  constructor(
    private productService: ProductService, private toastyService: ToastyService, private toastyConfig: ToastyConfig,
    private firebaseAuth: AngularFireAuth, private router: Router
  ) {
    this.toastyConfig.theme = "material";
    // console.log('dans la page addproduct')
    // console.log(this.url);
    //on charge les categories des articles
    this.firedata.once('value', (snapshot:any) =>{

      for (var categ in snapshot.val()){
        this.categList.push(snapshot.val()[categ])
      }
      // console.log(this.categList);
    })

    this.user = firebaseAuth.authState;
    this.user.subscribe((user:any) => {
      if (user) {
        this.userInfos = user;
        // console.log(this.userInfos);
      } else {
        this.userInfos = null;
      }
    });

  }

  ngOnInit() {}

  createProduct(productForm: NgForm) {
    const toastOptions: ToastOptions = {
      title: "Product Creation",
      msg:
        "product " + productForm.value["name"] + "is added successfully",
      showClose: true,
      timeout: 5000,
      theme: "default"
    };
    productForm.value["productId"] = "PROD_" + shortId.generate();
    productForm.value["productAdded"] = moment().unix();
    productForm.value["ratings"] = Math.floor(Math.random() * 5 + 1);
    // console.log(productForm.value["ratings"]);
    // console.log(productForm.value);
    if (productForm.value["productImageUrl"] === undefined) {
      productForm.value["productImageUrl"] =
        "http://via.placeholder.com/640x360/007bff/ffffff";
    }

    productForm.value["favourite"] = false;

    const date = productForm.value["productAdded"];
    // console.log(date);
    //this.productService.createProduct(productForm.value);
    // this.product = new Product();
    // console.log(this.product);

    // console.log(productForm.value["etat"]);
    const data = productForm.value;

    // ON PREPARE DES DONNEES DU VENDEUR
    this.firedataUser.child(this.userInfos.uid).once("value", (snapshot) =>{
      var va = snapshot.val() ;
      this.zone = va.country;
      this.phone = va.telephone;
      this.ville = va.ville;
      this.quartier = va.quartier;

      // console.log(this.zone);
      // console.log(data.name);

    //ON TESTE LES DONNES QUI ONT ETE SAISIE
    if (data.reduct == null){
      this.reduct2 = 1;
    }else{
      this.reduct2 = productForm.value["reduct"];
    }
    if (data.temps == null){
      this.tmp = 1;
    }else{
      this.tmp = data.temps;
    }
    if(data.discutable == true){
        this.discut = 'Discutable'
    }else{
        this.discut = 'Non Discutable';
    }
    if(data.name == undefined || data.description == undefined|| data.price == undefined|| data.stock == undefined|| data.etat == undefined||data.categ == undefined|| data.enchere == undefined){
      //Check if the checkboxes are selected ?
      alert("Vous devez vérifier les champs obligatoires (*) sont saisie");
      this.obligatoire = true;
      this.product = data;
      return ""
    }


    //CONTROLE DES DATES
    var dates = new Date().getTime();
    //alert(date);
    var date_tmps = (this.tmp * 24 * 60 * 60 * 3600) / 4;
    //alert(date_tmps);
    var nbre_sec = dates + date_tmps;
    console.log(nbre_sec);

    var pointure = data['pointure']?data['pointure']: 0;
    var taille = data['taille']?data['taille']: 0;
    var superficie = data['superficie']?data['superficie']: 0;
    var nbr_piece = data['nbr_piece']?data['nbr_piece']: 0;
    var transmission = data['transmission']?data['nbr_piece']: "";
    var kilometrage = data['kilometrage']?data['nbr_piece']: 0;
    var model = data['model']?data['nbr_piece']: "";

    //FONCTION DU CHARGEMENT

    // let file = this.selectedFiles.item(0)
    // this.currentUpload = new FileItem(file);
    // this.pushUpload(this.currentUpload, nbre_sec, this.discut, this.tmp, this.reduct2, this.zone, this.phone, this.ville, this.quartier, data.categ,
    // data.name, data.description, data.price, data.stock, data.etat, data.enchere)

    // console.log("this.selectedFiles", this.tab);
    // if(this.tab[0]){
    //   let file = this.tab[0]
    //   this.currentUpload = new FileItem(file);
    //   // console.log("name 1", this.currentUpload);
    //   this.uploadphoto(this.currentUpload);
    // }
    // if(this.tab[1]){
    //   let file1 = this.tab[1]
    //   this.currentUpload = new FileItem(file1);
    //   // console.log("name 2", this.currentUpload);
    //   this.uploadphoto(this.currentUpload);
    // }
    // if(this.tab[2]){
    //   let file2 = this.tab[2]
    //   this.currentUpload = new FileItem(file2);
    //   // console.log("name 3", this.currentUpload);
    //   this.uploadphoto(this.currentUpload);
    // }

    // console.log("urls ", this.urls);
    // console.log("urls 0", this.urls[0]);
    this.saveFileData(nbre_sec, this.discut, this.tmp, this.reduct2, this.zone, this.phone, this.ville, this.quartier, data.categ,
      data.name, data.description, data.price, data.stock, data.etat, data.enchere, pointure, taille, superficie, nbr_piece,
      transmission, kilometrage, model)
      //fini les infos du user
    });

    $("#exampleModalLong").modal("hide");

    this.toastyService.success(toastOptions);

  }

  //POUR UTILISER LA SELECTION MULTIPLE ON VA REMPLACER OU IL YA item(0) par ce code
//  uploadMulti() {
//    let files = this.selectedFiles
//    let filesIndex = _.range(files.length)
//    _.each(filesIndex, (idx) => {
//      this.currentUpload = new Upload(files[idx]);
//      this.pushUpload(this.currentUpload)}
//    )
//  }

  onFileChanged(event:any) {
    const file = event.target.files;
    // console.log("event", event);
    // console.log("file", file);
    // this.selectedFiles = file;
    // this.tab.push(file)
    if(this.url == ''){
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]); // read file as data url
        reader.onload = (event: any) => { // called once readAsDataURL is completed
          this.url = event.target.result;
          // console.log(this.url);
          this.currentUpload = new FileItem(file);
          // console.log("name 2", this.currentUpload);
          this.uploadphoto(this.currentUpload);
          // console.log("name 2", this.urls);
        }
      }
    }else {
      if(this.url2 == ''){
        if (event.target.files && event.target.files[0]) {
          var reader = new FileReader();
          reader.readAsDataURL(event.target.files[0]); // read file as data url
          reader.onload = (event: any) => { // called once readAsDataURL is completed
            this.url2 = event.target.result;
            // console.log(this.url2);
            this.currentUpload = new FileItem(file);
            // console.log("name 2", this.currentUpload);
            this.uploadphoto(this.currentUpload);
          }
        }
      }else{
        if (event.target.files && event.target.files[0]) {
          var reader = new FileReader();
          reader.readAsDataURL(event.target.files[0]); // read file as data url
          reader.onload = (event: any) => { // called once readAsDataURL is completed
            this.url3 = event.target.result;
            // console.log(this.url3);
            this.currentUpload = new FileItem(file);
            // console.log("name 2", this.currentUpload);
            this.uploadphoto(this.currentUpload);
          }
        }
      }

    }

  }

  suppImg(){
    console.log("ggg", this.urls);
    this.url = undefined!;
    this.currentUpload = undefined!;
    this.deleteFileStorage(this.urls[0]['name']);
  }
  suppImg1(){
    this.url2 = undefined!;
    this.currentUpload = undefined!;
    this.deleteFileStorage(this.urls[1]['name'])
  }
  suppImg2(){
    this.url3 = undefined!;
    this.currentUpload = undefined!;
    this.deleteFileStorage(this.urls[2]['name'])
  }

uploadphoto(upload: FileItem){
  let storageRef = firebase.storage().ref();
    let uploadTask = storageRef.child('images/'+ upload.file[0].name).put(upload.file[0]);
  // let url, name;
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
        upload.url = uploadTask.snapshot.downloadURL;
        upload.name = upload.file[0].name;
        this.urls.push({'url': upload.url, 'name': upload.name})
      })
      // this.urls.push({'url': upload.url, 'name': upload.name})
}


  // pushUpload(upload: FileItem, nbre_sec, discutable, temps, reduction, paysvendeur, phonevendeur, villevendeur, quartiervendeur,
  //   categ, nom, description, prix, stock, etat, enchere) {
  //   let storageRef = firebase.storage().ref();
  //   let uploadTask = storageRef.child('images/'+ upload.file.name).put(upload.file);

  //   uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
  //     (snapshot) =>  {
  //       // upload in progress
  //       upload.progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100
  //     },
  //     (error) => {
  //       // upload failed
  //       console.log(error)
  //     },
  //     () => {
  //       // upload success
  //       upload.url = uploadTask.snapshot.downloadURL
  //       upload.name = upload.file.name
  //       this.saveFileData(upload, upload.url, upload.name, nbre_sec, discutable, temps, reduction, paysvendeur, phonevendeur, villevendeur, quartiervendeur,
  //         categ, nom, description, prix, stock, etat, enchere)
  //     }
  //   );
  // }



 private saveFileData(nbre_sec:any, discutable:any, temps:any, reduction:any, paysvendeur:any, phonevendeur:any, villevendeur:any, quartiervendeur:any,
  categ:any, nom:any, description:any, prix:any, stock:any, etat:any, enchere:any, pointure:any, taille:any, superficie:any, nbr_piece:any,
  transmission:any, kilometrage:any, model:any) {


    //ON PREPARE LES REFERENCES
    var ref = this.firedataMenu;
    var ref2 = this.firedataEnchere;
    console.log("les urls", this.urls[0]);
   //LES DONNEES
   var dataToSave =  {

    // image:      url,
    name:       nom,
    // name_img:   name,
    description: description,
    price:      prix,
    stock:      stock,
    reduct:      reduction,
    etat:   etat,
    category:   categ,
    idvendeur: this.userInfos.uid,
    nomvendeur: this.userInfos.displayName,
    country: paysvendeur,
    date_enchere: nbre_sec,
    phone_vendeur: phonevendeur,
    ville_vendeur: villevendeur,
    quartier_vendeur: quartiervendeur,
    discut: discutable,

    pointure : pointure,
    taille : taille,
    superficie : superficie,
    nbr_piece : nbr_piece,
    transmission : transmission,
    kilometrage : kilometrage,
    model : model,


    //add image
    name_img : this.urls[0]?this.urls[0]['url']:"https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/baner%2Fmymarket.png?alt=media&token=ec804404-5c4b-4125-abe8-6e3a8ec2c1e7",
    image : this.urls[0]?this.urls[0]['url']:"https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/baner%2Fmymarket.png?alt=media&token=ec804404-5c4b-4125-abe8-6e3a8ec2c1e7",
    url_image1 : this.urls[0]?this.urls[0]['url']:"https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/baner%2Fmymarket.png?alt=media&token=ec804404-5c4b-4125-abe8-6e3a8ec2c1e7",// url1;
    url_image2 : this.urls[1]?this.urls[1]['url']:"https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/baner%2Fmymarket.png?alt=media&token=ec804404-5c4b-4125-abe8-6e3a8ec2c1e7",// url2;
    url_image3 : this.urls[2]?this.urls[2]['url']:"https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/baner%2Fmymarket.png?alt=media&token=ec804404-5c4b-4125-abe8-6e3a8ec2c1e7",// url3;
    // url_image4 : this.urls[3]?this.urls[3].url:"https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/baner%2Fmymarket.png?alt=media&token=ec804404-5c4b-4125-abe8-6e3a8ec2c1e7",// url4;

    name_image1 : this.urls[0]?this.urls[0]['name']:"https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/baner%2Fmymarket.png?alt=media&token=ec804404-5c4b-4125-abe8-6e3a8ec2c1e7",// url1;
    name_image2 : this.urls[1]?this.urls[1]['name']:"https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/baner%2Fmymarket.png?alt=media&token=ec804404-5c4b-4125-abe8-6e3a8ec2c1e7",// url2;
    name_image3 : this.urls[2]?this.urls[2]['name']:"https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/baner%2Fmymarket.png?alt=media&token=ec804404-5c4b-4125-abe8-6e3a8ec2c1e7",// url3;
    // name_image4 : this.urls[3]?this.urls[3].name:"https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/baner%2Fmymarket.png?alt=media&token=ec804404-5c4b-4125-abe8-6e3a8ec2c1e7",// url4;
  }
   //this.af.database.list(`/${this.IMAGES_FOLDER}`).push(image);
   if (enchere == true){
    console.log('cest une enchere console');
    ref2.push(dataToSave);
    this.router.navigate(["/products/all-enchere"]);
   }else{
     console.log('cest nest pas une enchere console');
     ref.push(dataToSave);
     this.router.navigate(["/products/all-products"]);
   }
 }

 //SUPPRIMER UN PRODUIT
 private deleteFileStorage(name:string) {
  let storageRef = firebase.storage().ref();
  storageRef.child('images/'+ name ).delete()
}
}
