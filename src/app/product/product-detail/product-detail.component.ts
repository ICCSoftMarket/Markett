import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Product } from "../../shared/models/product";
import { ProductService } from "../../shared/services/product.service";
import { LoaderSpinnerService } from "../../shared/loader-spinner/loader-spinner";

//add
import { AngularFireAuth } from "angularfire2/auth";
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject
} from "angularfire2/database";
import { NgForm, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Cart } from "../../shared/models/cart";
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import firebase from 'firebase/compat/app'
import { Observable } from "rxjs";
import { User } from "../../shared/models/user";
import { AuthService } from "../../shared/services/auth.service";
import * as GeoFire from "geofire";
import { ToastOptions, ToastyService, ToastyConfig } from "ng2-toasty";
import { Router } from "@angular/router";


@Component({
  selector: "app-product-detail",
  templateUrl: "./product-detail.component.html",
  styleUrls: ["./product-detail.component.scss"]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private sub: any;
  product: any;

  user!: Observable<firebase.User>;
  nbrLike:any;
  listLike:any[] = [];
  nbrNoLike:any;
  listNoLike:Cart[] = [];
  dejaLike:any;
  dejaNoLike:any;
  listComment:Cart[] = [];
  nbrcomment:any;
  infoUser:any;
  firedataMenu = firebase.database().ref('/menu');
  firedataEnchere = firebase.database().ref("/enchere");
  firedataUser = firebase.database().ref("/users");
  firedataOrder = firebase.database().ref('/orders');
  infos:any;
  productId:any;
  users;
  loggedUser!: User;
  data = {};
  geoFire: any;
  markers: any;
  lat!: number;
  lng!: number;
  distance!: number;
  idvendeur = [];
  ench = "false";
  paslocal:any;
  nbrPrix:any;
  listPrix:any;
  tablistPrix:any;
  listPrixTemp:any[] = [];
  allPrix2:any[] = [];
  model:any;
  OneSignal:any;

  enchereList!: Product[];
  dateDeLenchere:any;
  date_actuelle:any;
  date_evenement:any;
  minutes:any;
  heures:any;
  jours:any;
  secondes:any;
  enchere:any
  max:any;
  cachenum = false;
  cachenum2 = true;
  hidde1 = false;
  hidde2 = true;
  hidde3 = true;

  imagesBasic = [
    { img: 'https://mdbootstrap.com/img/Photos/Horizontal/Nature/12-col/img%20(117).jpg', thumb:
    'https://mdbootstrap.com/img/Photos/Horizontal/Nature/12-col/img%20(117).jpg', description: 'Image 1' }
    ];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,private toastyService: ToastyService, private toastyConfig: ToastyConfig,
    private spinnerService: LoaderSpinnerService, private authService: AuthService, private router: Router,
    private firebaseAuth: AngularFireAuth, private db: AngularFireDatabase, private modalService: NgbModal
  ) {
    this.product = new Product();

    this.sub = this.route.params.subscribe(params => {
      const id = params["id"]; // (+) converts string 'id' to a number
      this.productId = id;
      this.getProductDetail(id);
    });

    this.users = firebaseAuth.authState;
    this.users.subscribe((user:any) => {
      if (user) {
        this.infoUser = user;
        this.getInfoUser();
        console.log(this.infoUser);
      } else {
        this.infoUser = null;
      }
    });

  }

  ngOnInit() {
  //  this.loggedUser = this.authService.getLoggedInUser();
  //  this.infoUser = this.firebaseAuth.auth.currentUser;
  //  console.log(this.loggedUser);
  //  console.log(this.infoUser);

  }

  voirNum(){
    this.cachenum = true;
    this.cachenum2 = false;
  }
  getProductDetail(id: string) {
    this.spinnerService.show();
    const x = this.productService.getProductById(id);
    this.idvendeur = [];
    x.snapshotChanges().subscribe((product:any) => {
      this.spinnerService.hide();
      const y = product.payload.toJSON() as Product;
      console.log(y)
      if(y != null){
        y["$key"] = id;
        this.product = y;
        this.ench = "false";
        console.log(this.product.idvendeur)
        this.localise(this.product.idvendeur)
        this.nobreVote();
        this.nobreNoVote();
        this.nobreComment();

        //appel de geolocalisation du vendeur pour prendre la key du vendeur
      //this.localise(this.product.idvendeur)
      }else{
        this.spinnerService.show();
        const x = this.productService.getEnchereById(id);
        this.idvendeur = [];
        x.snapshotChanges().subscribe((product:any) => {
          this.spinnerService.hide();
          const y = product.payload.toJSON() as Product;

          y["$key"] = id;
          this.product = y;
          this.ench = "true";
          console.log(this.product)
          this.localise(this.product.idvendeur)
          this.nobreVote();
          this.nobreNoVote();
          this.nobreComment();

        });
      }
    });


  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  addToCart(product: Product) {
    console.log(product.$key)
    this.productService.addToCart(product, this.productId);
  }


    //*******************DONNEZ DES LIKE */
like(){
  if(this.infoUser == null){
    alert("Vous devez vous connter svp!!!")
  }else{
    if(this.ench == "false"){
      this.firedataMenu.child(this.productId).child('like').orderByChild('uid').equalTo(this.infoUser.uid).once('value', (snapshot:any)=>{
        console.log(snapshot.val());
        if (snapshot.val()){
          console.log('il a déjà voté');
        }else{
          console.log('pas');
          this.firedataMenu.child(this.productId).child('like').push({
            uid: this.infoUser.uid,
            name: this.infoUser.displayName,
            dejavote: true

          });
        }
      })
    }else{
      this.firedataEnchere.child(this.productId).child('like').orderByChild('uid').equalTo(this.infoUser.uid).once('value', (snapshot:any)=>{
        console.log(snapshot.val());
        if (snapshot.val()){
          console.log('il a déjà voté');
        }else{
          console.log('pas');
          this.firedataEnchere.child(this.productId).child('like').push({
            uid: this.infoUser.uid,
            name: this.infoUser.displayName,
            dejavote: true

          });
        }
      })
    }

  }
}

  nobreVote(){
    console.log(this.ench)
    if(this.ench == "true"){
      this.nbrLike = 0;
      const x = this.db.list('/enchere/'+ this.productId + '/like');
      console.log(x);
      x.snapshotChanges().subscribe((prod:any) => {
        this.spinnerService.hide();
        this.listLike = [];
        prod.forEach((element:any) => {
          const y = element.payload.toJSON();
          y["$key"] = element.key;
          this.listLike.push(y as Cart);
          this.nbrLike = this.listLike.length;
          this.dejaLike = y["dejavote"];
          console.log(this.dejaLike);
          console.log(this.listLike);
        });
      });
    }else{
      this.nbrLike = 0;
      const x = this.db.list('/menu/'+ this.productId + '/like');
      console.log(x);
      x.snapshotChanges().subscribe((prod:any) => {
        this.spinnerService.hide();
        this.listLike = [];
        prod.forEach((element:any) => {
          const y = element.payload.toJSON();
          y["$key"] = element.key;
          this.listLike.push(y as Cart);
          this.nbrLike = this.listLike.length;
          this.dejaLike = y["dejavote"];
          console.log(this.dejaLike);
          console.log(this.listLike);
        });
      });
    }

  }


  //********************DONNEZ DES NOLIKE */
  noLike(){
    if(this.infoUser == null){
      alert("Vous devez vous connter svp!!!")
    }else{

      if(this.ench == "true"){
        this.firedataEnchere.child(this.productId).child('nolike').orderByChild('uid').equalTo(this.infoUser.uid).once('value', (snapshot:any)=>{
          console.log(snapshot.val());
          if (snapshot.val()){
            console.log('il a déjà no voté');
          }else{
            console.log('pas');
            this.firedataEnchere.child(this.productId).child('nolike').push({
              uid: this.infoUser.uid,
              name: this.infoUser.displayName,
              dejanovote: true

            });
          }
        })
      }else{
        this.firedataMenu.child(this.productId).child('nolike').orderByChild('uid').equalTo(this.infoUser.uid).once('value', (snapshot:any)=>{
          console.log(snapshot.val());
          if (snapshot.val()){
            console.log('il a déjà no voté');
          }else{
            console.log('pas');
            this.firedataMenu.child(this.productId).child('nolike').push({
              uid: this.infoUser.uid,
              name: this.infoUser.displayName,
              dejanovote: true

            });
          }
        })
      }
    }
  }

    nobreNoVote(){
      if(this.ench == "true"){
        this.nbrNoLike = 0;
        const x = this.db.list('/enchere/'+ this.productId + '/nolike');
        console.log(x);
        x.snapshotChanges().subscribe((prod:any) => {
          this.spinnerService.hide();
          this.listNoLike = [];
          prod.forEach((element:any) => {
            const y = element.payload.toJSON();
            y["$key"] = element.key;
            this.listNoLike.push(y as Cart);
            this.nbrNoLike = this.listNoLike.length;
            this.dejaNoLike = y["dejanovote"];
          });
        });
      }else{
        this.nbrNoLike = 0;
        const x = this.db.list('/menu/'+ this.productId + '/nolike');
        console.log(x);
        x.snapshotChanges().subscribe((prod:any) => {
          this.spinnerService.hide();
          this.listNoLike = [];
          prod.forEach((element:any) => {
            const y = element.payload.toJSON();
            y["$key"] = element.key;
            this.listNoLike.push(y as Cart);
            this.nbrNoLike = this.listNoLike.length;
            this.dejaNoLike = y["dejanovote"];
          });
        });
      }



      if(this.ench == "true" && this.infoUser != null){
        /*this.firedataEnchere.child(this.productId).on('value', (snapshot)=>{
          if(snapshot.val().idvendeur == this.infoUser.uid){
            //liste des prix proposés si cest le vendeur qui consulte
            this.nbrPrix = 0;
            const xx = this.db.list('/enchere/' + this.productId + '/prix');
            console.log(xx)
            xx.snapshotChanges().subscribe(prix => {
              this.spinnerService.hide();
              this.listPrix = [];
              prix.forEach(element => {
                const y = element.payload.toJSON();
                y["$key"] = element.key;
                this.listPrix.push(y as Cart);
                this.nbrPrix = this.listPrix.length;
                console.log(this.listPrix);
                console.log(this.nbrPrix);
              });
            });
            this.listPrix = this.listPrix.sort((a, b) => a["prix"] < b["prix"] ? 1 : a["prix"] === b["prix"] ? 0 : -1);


          }else{
            //654879167
            this.allPrix2 = [];
            this.firedataEnchere.child(this.productId).child('prix').child(this.infoUser.uid).child(snapshot.val().idvendeur).once('value', (snapshot)=>{
                for(var i in snapshot.val()){
                  this.allPrix2.push(snapshot.val()[i])
                }

              this.firedataEnchere.child(this.productId).child('prix').child(this.infoUser.uid).child(this.infoUser.uid).once('value', (snapshotirem)=>{
                  for(var i in snapshotirem.val()){
                    this.allPrix2.push(snapshotirem.val()[i])
                  }
                  console.log( this.allPrix2);

                })
              })
              this.allPrix2 = this.allPrix2.sort((a, b) => a["prix"] < b["prix"] ? 1 : a["prix"] === b["prix"] ? 0 : -1);
          }
        })*/
        console.log("pas de discussion de prix pour les ventes aux encheres")
      }else if(this.ench == "false" && this.infoUser != null){

      console.log(this.ench)
        this.firedataMenu.child(this.productId).on('value', (snapshot:any)=>{
          if(snapshot.val().idvendeur == this.infoUser.uid){
            //liste des prix proposés si cest le vendeur qui consulte
            this.nbrPrix = 0;
            const xx = this.db.list('/menu/' + this.productId + '/prix');
            console.log(xx)
            xx.snapshotChanges().subscribe((prix:any) => {
              this.spinnerService.hide();
              this.listPrix = [];
              prix.forEach((element:any) => {
                const y = element.payload.toJSON();
                y["$key"] = element.key;
                this.listPrix.push(y as Cart);
                this.nbrPrix = this.listPrix.length;
                console.log(this.listPrix);
                console.log(this.nbrPrix);
              });
            });
            this.listPrix = this.listPrix.sort((a:any, b:any) => a["prix"] < b["prix"] ? 1 : a["prix"] === b["prix"] ? 0 : -1);

          }else{
            //654879167
            this.allPrix2 = [];
            this.firedataMenu.child(this.productId).child('prix').child(this.infoUser.uid).child(snapshot.val().idvendeur).once('value', (snapshot:any)=>{
                for(var i in snapshot.val()){
                  this.allPrix2.push(snapshot.val()[i])
                }

              this.firedataMenu.child(this.productId).child('prix').child(this.infoUser.uid).child(this.infoUser.uid).once('value', (snapshotirem:any)=>{
                  for(var i in snapshotirem.val()){
                    this.allPrix2.push(snapshotirem.val()[i])
                  }
                  console.log( this.allPrix2);

                })
              })
              this.allPrix2 = this.allPrix2.sort((a, b) => a["prix"] < b["prix"] ? 1 : a["prix"] === b["prix"] ? 0 : -1);
          }
        })


      }

}

  //*****************AJOUT DE COMMENTAIRE */

  //OUVRIR LE FORMULAIRE AJOUT ADRESSE LIVRAISON
    open(content:any) {
      if(this.infoUser == null){
        alert("vous devez vous connecter svp!!!");
      }else{
        this.modalService.open(content);
      }

    }


  //AJOUTER UN COMMENTAIRE
  addCommentaire(commentForm: NgForm) {
    const dataform = commentForm.value;
    console.log(this.ench);

      console.log(this.infos.image_profile);
    if(this.ench == "false"){
        this.firedataMenu.child(this.productId).child('comment').push({
          uid: this.infoUser.uid,
          name: this.infoUser.displayName,
          comment: dataform.commentaire,
          image: this.infos.image_profile,
          date: new Date().toISOString()

        });
        const toastOption: ToastOptions = {
          title: "Ajout du commentaire",
          msg: "commentaire pour ce produit",
          showClose: true,
          timeout: 1000,
          theme: "material"
        };
        this.toastyService.wait(toastOption);
        setTimeout(() => {
          //localStorage.setItem("cartsss_item", JSON.stringify(a));
          this.modalService.dismissAll();
        }, 500);
      }else{
        this.firedataEnchere.child(this.productId).child('comment').push({
          uid: this.infoUser.uid,
          name: this.infoUser.displayName,
          comment: dataform.commentaire,
          image: this.infos.image_profile,
          date: new Date().toISOString()

        });
        const toastOption: ToastOptions = {
          title: "Ajout du commentaire",
          msg: "commentaire pour ce produit",
          showClose: true,
          timeout: 1000,
          theme: "material"
        };
        this.toastyService.wait(toastOption);
        setTimeout(() => {
          //localStorage.setItem("cartsss_item", JSON.stringify(a));
          this.modalService.dismissAll();
        }, 500);
      }

    }



    //COMPTER LE NOMBRE DE COMMENTAIRES
    nobreComment(){
      if(this.ench == "true"){
        this.nbrcomment = 0;
        const x = this.db.list('/enchere/'+ this.productId + '/comment');
        console.log(x);
        x.snapshotChanges().subscribe((comment:any) => {
          this.spinnerService.hide();
          this.listComment = [];
          comment.forEach((element:any) => {
            const y = element.payload.toJSON();
            y["$key"] = element.key;
            this.listComment.push(y as Cart);
            this.nbrcomment = this.listComment.length;
            console.log(this.nbrcomment);
            console.log(this.listComment);
          });
        });
      }else{
        this.nbrcomment = 0;
        const x = this.db.list('/menu/'+ this.productId + '/comment');
        console.log(x);
        x.snapshotChanges().subscribe((comment:any) => {
          this.spinnerService.hide();
          this.listComment = [];
          comment.forEach((element:any) => {
            const y = element.payload.toJSON();
            y["$key"] = element.key;
            this.listComment.push(y as Cart);
            this.nbrcomment = this.listComment.length;
            console.log(this.nbrcomment);
            console.log(this.listComment);
          });
        });
      }

    }

    getInfoUser(){
      console.log(this.infoUser);
      const x = this.productService.getUsers(this.infoUser.uid);
      console.log(x);
      x.snapshotChanges().subscribe((use:any) => {
        console.log(use);
        use.forEach((element:any) => {
          const inf = element.payload.toJSON();
          console.log(inf);
          this.infos = inf;
        });
      });

  }
//fonction pour geolocaliser le vendeur
  localise(keyvendeur:any){

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
     this.lat = position.coords.latitude;
     this.lng = position.coords.longitude;
  console.log(this.infoUser)
  console.log(this.product)
  firebase.database().ref('/locations').orderByChild('uid').equalTo(keyvendeur).once('value',(snapshot:any) =>{

    if(snapshot.val()){
      this.markers = [];
      for (var i in snapshot.val()){
        console.log(snapshot.val()[i].l[0])

        var local = [this.lat, this.lng];
        var lautre = [snapshot.val()[i].l[0], snapshot.val()[i].l[1]];
        // this.distance = GeoFire.distance(local, lautre).toFixed(2);
        console.log(this.distance)

        this.markers.push({
          location: snapshot.val()[i].l,
          distance: this.distance,
          photo: snapshot.val()[i].photo,
          description: snapshot.val()[i].description,
          name: snapshot.val()[i].name,
          tel: snapshot.val()[i].tel,
          uid: snapshot.val()[i].uid
        });


        }
        console.log(this.markers)
    }else{
      this.paslocal = true;
      alert("ce vendeur n'a pas active sa localisation")
    }

    });
  });

}
  }
//fin

  //discussion de prix
  openPrix(contentPrix:any){
    if(this.infoUser == null){
      alert("Vous devez etre connecté pour démarrer la discussion")
    }else
      this.modalService.open(contentPrix);


  }

  donPix(prixForm: NgForm){
    //pour le client
    var dataform = prixForm.value;
    var idvendeur = this.product.idvendeur;
    var userId = this.infoUser;
    var productId = this.productId;
    var userObj = this.infos;
    var firedataMenu = this.firedataMenu;
    var firedataUser = this.firedataUser;
    var modalService = this.modalService;
    firedataMenu.child(productId).child('prix').child(userId.uid).once('value', function(itemsnapshot:any){
      console.log(itemsnapshot.val())
      if(itemsnapshot.val()){
        firedataMenu.child(productId).child('prix').child(userId.uid).child(idvendeur).push({
          uid: userId.uid,
          name: userId.displayName,
          prix: dataform.prix,
          image: userObj.image_profile,
          idOnesignal: userObj.idOnesignal || '',
          date: new Date().toISOString(),
          telephone: userObj.telephone || 'pas renseigné',
          quartier: userObj.quartier || 'pas renseigné',
          ville: userObj.ville || 'pas renseigné'
          });
          //notif
            console.log(userObj.idOnesignal)

      }else{
        console.log(productId);
        console.log(userId.uid);
        firedataMenu.child(productId).child('prix').child(userId.uid).set({
          uid: userId.uid,
          name: userId.displayName,
          prix: dataform.prix,
          image: userObj.image_profile,
          idOnesignal: userObj.idOnesignal || '',
          date: new Date().toISOString(),
          telephone: userObj.telephone || 'pas renseigné',
          quartier: userObj.quartier || 'pas renseigné',
          ville: userObj.ville || 'pas renseigné'
          //interne: false
          });
        firedataMenu.child(productId).child("prix").child(userId.uid).child(idvendeur).push({
          uid: userId.uid,
          name: userId.displayName,
          prix: dataform.prix,
          image: userObj.image_profile,
          idOnesignal: userObj.idOnesignal || '',
          date: new Date().toISOString(),
          telephone: userObj.telephone || 'pas renseigné',
          quartier: userObj.quartier || 'pas renseigné',
          ville: userObj.ville || 'pas renseigné'
          //interne: true
          });
          console.log(userObj.idOnesignal)
      }
    })
    const toastOption: ToastOptions = {
      title: "Ajout du prix",
      msg: "Donnez votre prix",
      showClose: true,
      timeout: 1000,
      theme: "material"
    };
    this.toastyService.wait(toastOption);
    setTimeout(() => {
      //localStorage.setItem("cartsss_item", JSON.stringify(a));
      this.modalService.dismissAll();
    }, 500);
    this.sendNotif(userObj.idOnesignal, dataform.prix)
  }


  discussionClient(prix:any, contentPrixDiscut:any){
    this.modalService.dismissAll();
    this.listPrixTemp = [];
    this.firedataMenu.child(this.productId).child('prix').child(prix.uid).child(this.infoUser.uid).once('value', (snapshot:any)=>{
      console.log(snapshot.val())
      for(var i in snapshot.val()){
        this.listPrixTemp.push(snapshot.val()[i])
      }

      this.firedataMenu.child(this.productId).child('prix').child(prix.uid).child(prix.uid).once('value', (snapshotirem:any)=>{
        for(var i in snapshotirem.val()){
          this.listPrixTemp.push(snapshotirem.val()[i])
        }
        console.log(this.listPrixTemp);
      })
    })
    this.tablistPrix = this.listPrixTemp.sort((a, b) => a["prix"] < b["prix"] ? 1 : a["prix"] === b["prix"] ? 0 : -1);
    console.log(this.tablistPrix)
    this.model = prix;
    this.modalService.open(contentPrixDiscut, this.model);
  }


  donPixvendeur(prixForm: NgForm, model:any){
    console.log(model)
    var dataform = prixForm.value;
    this.firedataMenu.child(this.productId).child('prix').child(model.uid).child(model.uid).push({
      uid: this.infoUser.uid,
      name: this.infoUser.displayName,
      prix: dataform.prix,
      image: this.infos.image_profile,
      idOnesignal: this.infos.idOnesignal || '',
      date: new Date().toISOString(),
      telephone: this.infos.telephone || 'pas renseigné',
      quartier: this.infos.quartier || 'pas renseigné',
      ville: this.infos.ville || 'pas renseigné'

      });
      console.log(this.infos.idOnesignal)
      this.modalService.dismissAll();
      this.sendNotif(this.infos.idOnesignal, dataform.prix)

  }


  //VALIDATION DE LA VENTE ON GENERE LE ORDER

  validPrix(model:any){
    console.log(model);
    console.log(this.product);


        if(this.product.idvendeur == model.uid){
          //SI ON VALID LA PROPOSITION DU VENDEUR
          var n =0;
          this.firedataOrder.orderByChild("product_id").equalTo(this.productId).on('value', (itemsnap:any)=>{
            console.log(itemsnap.val())
            var key ="";
            if(!itemsnap.val()){
              console.log('si la commande du produit nexiste pas on cree')
                this.firedataOrder.push({
                  //Product data is hardcoded for simplicity
                  product_name: this.product.name,
                  name_img: this.product.name_img,
                  product_price: model.prix,
                  product_image: this.product.image,
                  product_id: this.productId,
                  idvendeur: this.product.idvendeur,
                  nomvendeur: this.product.nomvendeur,
                  phonevendeur: this.product.phone_vendeur,

                  //item data
                  item_qty: 1,

                  //Order data
                  user_id: this.infos.uid,
                  user_name:this.infos.name,
                  user_acheteur:this.infos.name,
                  user_phone:this.infos.telephone,
                  user_quartier:this.infos.quartier,
                  address_id: this.infos.ville,
                  payment_id: 'CREDIT',
                  date_commande: new Date().toISOString(),
                  status: "En attente",
                  message: "Appeler pour la livraison"

                });
                //sendNotifValidPrix(this.infos.idOnesignal, this.infos.name)


            }else if(itemsnap.val() && n == 0){
              console.log('si elle existe on met à jour')
              n += 1;
              console.log('on update')
              for(var k in itemsnap.val()){
                console.log(key)
                key = k;
              }
              // console.log(key)
              this.firedataOrder.child(key).update({
                product_price: model.prix
              });
            }
          })

        }else{
          //SI LE VENDEUR VALID LA PROPOSITION DU CLIENT
          var n =0;
          this.firedataOrder.orderByChild("product_id").equalTo(this.productId).on('value', (itemsnap:any)=>{
            console.log(itemsnap.val())
            console.log(n)
            if(!itemsnap.val()){
              //sil il a des commandes et le produit se trouve dans ses commandes on update seulement
              console.log("on cree")
              //dans les autres cas on cree seulement
              this.firedataOrder.push({
                //Product data is hardcoded for simplicity
                product_name: this.product.name,
                name_img: this.product.name_img,
                product_price: model.prix,
                product_image: this.product.image,
                product_id: this.productId,
                idvendeur: this.product.idvendeur,
                nomvendeur: this.product.nomvendeur,
                phonevendeur: this.product.phone_vendeur,

                //item data
                item_qty: 1,

                //Order data
                user_id: model.uid,
                user_name:model.name,
                user_acheteur:model.name,
                user_phone:model.telephone,
                user_quartier:model.quartier,
                address_id: model.ville,
                payment_id: 'CREDIT',
                date_commande: new Date().toISOString(),
                status: "En attente",
                message: "Appeler pour la livraison"

              });
              //sendNotifValidPrix(model.idOnesignal, this.product.nomvendeur)
              //sharedUtils.showAlert("Félicitation","Vous etes tombé d'accord sur ce prix une commande a été générée")
              //$state.go('offers', {}, {location: "replace", reload: true,inherit: false, notify: true});
            }else if(itemsnap.val() && n == 0){
              n += 1;
              console.log('on update')
              for(var k in itemsnap.val()){
                console.log(k)
                var key = k;

              }
              var key ="";
              // console.log(k)
              this.firedataOrder.child(key).update({
                product_price: model.prix,
                user_id: model.uid,
                user_name:model.name,
                user_acheteur:model.name,
                user_phone:model.telephone,
                user_quartier:model.quartier,
                address_id: model.ville

              });

            }//fin else

          })
        }
        const toastOption: ToastOptions = {
          title: "Un commande a été envoyé ",
          msg: "Commande générée à votre nom",
          showClose: true,
          timeout: 9000,
          theme: "material"
        };
        this.toastyService.success(toastOption);
        this.modalService.dismissAll();

        this.sendNotifValidPrix(this.infos.idOnesignal, this.product.nomvendeur)
    //sharedUtils.showAlert("Félicitation","Vous etes tombé d'accord sur ce prix une commande a été générée")


  }


  //LA NOTIF
  sendNotif(id:any, prix:any){
    console.log('notif')
    // @ts-ignore
    window["plugins"].getIds((ids: any) => {

      var notificationObj = { contents: {en: prix + " pour " + this.product.name},
        include_player_ids: [id],
        data: {data_key: "data_value", openURL: "https://imgur.com/", id: this.productId},
        //buttons: [{"id": "1", "text": "suivre", "icon": "ic_menu_share"}, {"id": "2", "text": "just button2", "icon": "ic_menu_send"}]

      };
        // @ts-ignore
      window["plugins"].OneSignal.postNotification(notificationObj,
          function(successResponse:any) {
              console.log("Notification Post Success:", successResponse);
              alert("Notification envoyé: " + successResponse);
          },
          function (failedResponse:any) {
              console.log("Notification Post Failed: ", failedResponse);
              //alert("Notification a échoué:\n" + JSON.stringify(failedResponse));
              alert("la notification n'a pas été envoyé")
          }
        );
    });
  }


  sendNotifValidPrix(id:any, nomvendeur:any){

    // @ts-ignore
    window["plugins"].OneSignal.getIds((ids: any) => {
      var notificationObj = { contents: {en: " vous avez reçu une commande de "+ nomvendeur},
        include_player_ids: [id],
        data: {data_key: "commande", openURL: "https://imgur.com/", id: this.productId},
      };
        // @ts-ignore
      window["plugins"].OneSignal.postNotification(notificationObj,
          function(successResponse:any) {
              console.log("Notification Post Success:", successResponse);
              alert("Notification a été envoyé: " + successResponse);
          },
          function (failedResponse:any) {
              console.log("Notification Post Failed: ", failedResponse);
              //alert("Notification a échoué:\n" + JSON.stringify(failedResponse));
              alert("la notification n'a pas été envoyé")
          }
        );
    });
  }
  //FIN NOTIF


  //  COMPTE A REBOURS
  compte_a_rebour(id:any){
      this.date_actuelle = new Date();
      this.date_evenement = new Date(this.product["date_enchere"]);
      var total_secondes = Math.round((this.date_evenement - this.date_actuelle) / 1000);
      var prefixe = "Temps restant: ";
      if (total_secondes < 0)
      {
         prefixe = "Terminé il y a "; // On modifie le préfixe si la différence est négatif
        total_secondes = Math.abs(total_secondes); // On ne garde que la valeur absolue

      }
      if (total_secondes > 0)
      {
        this.jours = Math.floor(total_secondes / (60 * 60 * 24));
        this.heures = Math.floor((total_secondes - (this.jours * 60 * 60 * 24)) / (60 * 60));
        this.minutes = Math.floor((total_secondes - ((this.jours * 60 * 60 * 24 + this.heures * 60 * 60))) / 60);
        this.secondes = Math.floor(total_secondes - ((this.jours * 60 * 60 * 24 + this.heures * 60 * 60 + this.minutes * 60)));

        var et = "et";
        var mot_jour = "jrs:";
        var mot_heure = "h:";
        var mot_minute = "min:";
        var mot_seconde = "s";

        if (this.jours == 0)
        {
          this.jours = '';
            mot_jour = '';
        }
        else if (this.jours == 1)
        {
            mot_jour = "jour,";
        }

        if (this.heures == 0)
        {
          this.heures = '';
            mot_heure = '';
        }
        else if (this.heures == 1)
        {
            mot_heure = "heure,";
        }

        if (this.minutes == 0)
        {
          this.minutes = '';
            mot_minute = '';
        }
        else if (this.minutes == 1)
        {
            mot_minute = "minute,";
        }

        if (this.secondes == 0)
        {
          this.secondes = '';
            mot_seconde = '';
            et = '';
        }
        else if (this.secondes == 1)
        {
            mot_seconde = "seconde";
        }

        if (this.minutes == 0 && this.heures == 0 && this.jours == 0)
        {
            et = "";
        }

        var compte_a_rebours = prefixe + this.jours + ' ' + mot_jour + ' ' + this.heures + ' ' + mot_heure + ' ' + this.minutes + ' ' + mot_minute + ' ' + this.secondes + ' ' + mot_seconde;

      }

      if(total_secondes == 0)
      {
          var compte_a_rebours = 'Compte à rebours terminé.';

      }
      //setTimeout(this.compte_a_rebour(id),1000);
      //setInterval(this.compte_a_rebour(id), 1000);
      // @ts-ignore
    return compte_a_rebours;
  };


  //OVREIR LE FAIRE UNE OFFRE
  openOffre(contentOffre:any, data:any) {
    this.data = data;

    if(this.infoUser != null){
      this.modalService.open(contentOffre);
    }else {
      alert('Vous devez vous connecter pour faire une offre')
      this.router.navigate(["/index/login"]);
    }
  }

  //AJOUTER UNE ADRESSE DE LIVRAISON
  offreEnchere(offreForm: NgForm, data:any) {

    console.log(data);
    console.log(data.$key);
    console.log(offreForm.value["montant"]);
    this.enchere = offreForm.value["montant"];
    const x = this.productService.getUsers(this.infoUser.uid);
    console.log(x);
    x.snapshotChanges().subscribe((use:any) => {
      console.log(use);
      use.forEach((element:any) => {
        const inf = element.payload.toJSON();
        console.log(inf);
        this.infos = inf;
        console.log(this.data);
        this.firedataEnchere.child(data.$key).child("offres").push({

          montant_enchere: this.enchere,
          country: data.country,
          date_commande: new Date().toISOString(),
          idacheteur: this.infoUser.uid,
          idvendeur: data.idvendeur,
          image: data.image,
          name: data.name,
          nomacheteur: this.infos.name,
          nomvendeur: data.nomvendeur,
          prix_initial: data.price,
          quartier_acheteur: this.infos.quartier,
          telephone_acheteur: this.infos.telephone,
          name_img: data.name_img
        });

      });
    });
    this.modalService.dismissAll();
  }

//CALCULER LA MEILLEURE OFFRE
  getMaxOffre(id:any){
    var tab = [];
      if (this.product.$key == id){
        for (var m in this.product["offres"]){
          tab.push(this.product["offres"][m].montant_enchere);
          //console.log(Math.max(...tab));

        }
      }
    this.max = Math.max(...tab);
    return this.max;
  }


  changeImageBg(img:any){
    if(img==1){
      this.hidde1 = false;
      this.hidde2 = true;
      this.hidde3 = true;
    }
    if(img==2){
      this.hidde2 = false;
      this.hidde1 = true;
      this.hidde3 = true;
    }
    if(img==3){
      this.hidde3 = false;
      this.hidde2 = true;
      this.hidde1 = true;
    }

  }

}
