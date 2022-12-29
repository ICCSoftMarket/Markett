import { Component, OnInit } from "@angular/core";
import { NgForm, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { User } from "../../shared/models/user";
import { AuthService } from "../../shared/services/auth.service";

//add
import { ProductService } from "../../shared/services/product.service";
import firebase from 'firebase/compat/app'
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
//import { ActivatedRoute } from "@angular/router";
import { Router, ActivatedRoute } from "@angular/router";
import * as GeoFire from 'geofire';

@Component({
  selector: "app-userid-account",
  templateUrl: "./userid-account.component.html",
  styleUrls: ["./userid-account.component.scss"]
})
export class UserIdAccountComponent implements OnInit {
  loggedUser!: User;
  // Enable Update Button
infoUser:any;
detailUser:any;
infos:any;
infosList= [];
firedata = firebase.database().ref('/users');
firedataVente = firebase.database().ref('/vente');
productList!: Product[];
page = 1;
lisAddress : Cart[] = [];
myToggle= {};
data = {};
modal: NgbModalRef;
users;
supp = {};
selectedFiles!: FileList;
currentUpload!: FileItem;
url = '';
bg:any;
private sub: any;
nbrLike:any;
listLike: Cart[] = [];
nbrNoLike:any;
listNoLike: Cart[] = [];
dejaLike:any;
dejaNoLike:any;
listComment: Cart[] = [];
nbrcomment:any;
myInfos:any;
nbrLikeComment:any;
listLikeComment:any[] = [];
tabvente:any[] = [];
nbreVente !: number;
geoFire: any;
markers: any;
lat!: number;
lng!: number;
distance!: number;

  constructor(private authService: AuthService, private productService: ProductService, private firebaseAuth: AngularFireAuth,
              config: NgbModalConfig, private modalService: NgbModal, private db: AngularFireDatabase, private spinnerService: LoaderSpinnerService,
              private route: ActivatedRoute,private router: Router) {
    //this.infoUser = this.authService.userDetails.uid;
    config.backdrop = 'static';
    config.keyboard = false;
    //this.infoUser2 = this.productService.getUsers(this.infoUser)

    this.sub = this.route.params.subscribe(params => {
      const id = params["id"]; // (+) converts string 'id' to a number
      this.infoUser = id;
      console.log(this.infoUser);
    });

    this.users = firebaseAuth.authState;
    this.users.subscribe((user:any) => {
      if (user) {
        //this.infoUser = user;
        this.detailUser = user;
        //console.log(this.infoUser);
        const x = this.db.list('/users/'+this.infoUser + '/address');
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
        this.router.navigate(["/index/login"]);
      }
    });

  }

  ngOnInit() {
    this.loggedUser = this.authService.getLoggedInUser();
    this.getInfoUser();
    this.getProductUser();
    this.nobreVote();
    this.nobreNoVote();
    this.nobreComment();
    //this.getMyInfoUser();
    this.nbrvente();
  }

  //*******************DONNEZ DES LIKE */
like(user:any){
console.log(user);

this.firedata.child(this.infoUser).child('like').orderByChild('uid').equalTo(user.uid).once('value', (snapshot:any)=>{
    console.log(snapshot.val());
    if (snapshot.val()){
      console.log('il a déjà voté');
    }else{
      console.log('pas');
      this.firedata.child(this.infoUser).child('like').push({
        uid: user.uid,
        name: user.displayName,
        dejavote: true

      });
    }
  })
}

nobreVote(){
  this.nbrLike = 0;
  const x = this.db.list('/users/'+ this.infoUser + '/like');
  console.log(x);
  x.snapshotChanges().subscribe((address:any) => {
    this.spinnerService.hide();
    this.listLike = [];
    address.forEach((element:any) => {
      const y = element.payload.toJSON();
      y["$key"] = element.key;
      this.listLike.push(y as Cart);
      this.nbrLike = this.listLike.length;
      this.dejaLike = y["dejavote"];
      // console.log(this.dejaLike);
      // console.log(this.listLike);
    });
  });
}
//********************DONNEZ DES NOLIKE */
noLike(user:any){
  console.log(user);

  this.firedata.child(this.infoUser).child('nolike').orderByChild('uid').equalTo(user.uid).once('value', (snapshot:any)=>{
      console.log(snapshot.val());
      if (snapshot.val()){
        console.log('il a déjà no voté');
      }else{
        console.log('pas');
        this.firedata.child(this.infoUser).child('nolike').push({
          uid: user.uid,
          name: user.displayName,
          dejanovote: true

        });
      }
    })
  }

  nobreNoVote(){
    this.nbrNoLike = 0;
    const x = this.db.list('/users/'+ this.infoUser + '/nolike');
    console.log(x);
    x.snapshotChanges().subscribe((address:any) => {
      this.spinnerService.hide();
      this.listNoLike = [];
      address.forEach((element:any) => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.listNoLike.push(y as Cart);
        this.nbrNoLike = this.listNoLike.length;
        this.dejaNoLike = y["dejanovote"];
        console.log(this.dejaNoLike);
        console.log(this.listNoLike);
      });
    });
  }

//*****************AJOUT DE COMMENTAIRE */

//OUVRIR LE FORMULAIRE AJOUT ADRESSE LIVRAISON
  open(content:any) {
    this.modalService.open(content);

  }


//AJOUTER UN COMMENTAIRE
addCommentaire(commentForm: NgForm) {
  const dataform = commentForm.value;
  console.log(dataform);

  this.firedata.child(this.infoUser).child('comment').orderByChild('uid').equalTo(this.detailUser.uid).once('value', (snapshot:any)=>{
    console.log(snapshot.val());
    console.log(this.infos.image_profile);
    console.log(this.infos);
    console.log(this.myInfos);

      console.log('pas');
      console.log(new Date().toISOString());
      this.firedata.child(this.infoUser).child('comment').push({
        uid: this.detailUser.uid,
        name: this.detailUser.displayName,
        comment: dataform.commentaire,
        image: this.myInfos.image_profile,
        date: new Date().toISOString()

      });

  })

    this.modalService.dismissAll();

  }

  //COMPTER LE NOMBRE DE COMMENTAIRES
  nobreComment(){
    this.nbrcomment = 0;
    const x = this.db.list('/users/'+ this.infoUser + '/comment');
    console.log(x);
    x.snapshotChanges().subscribe((address:any) => {
      this.spinnerService.hide();
      this.listComment = [];
      address.forEach((element:any) => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.listComment.push(y as Cart);
        this.nbrcomment = this.listComment.length;
        console.log(this.nbrcomment);
        console.log(this.listComment);
      });
    });
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

        //infos de lutilisateur connecté
        console.log(this.detailUser.uid);
        const xx = this.productService.getUsers(this.detailUser.uid);
        console.log(xx);
        xx.snapshotChanges().subscribe((use:any) => {
          console.log(use);
          use.forEach((element:any) => {
            const infs = element.payload.toJSON();
            console.log(infs);
            this.myInfos = infs;
            console.log(this.myInfos);

          });
        });
      });
    });
  }


  getMyInfoUser(){
    console.log(this.detailUser.uid);
    const x = this.productService.getUsers(this.detailUser.uid);
    console.log(x);
    x.snapshotChanges().subscribe((use:any) => {
      console.log(use);
      use.forEach((element:any) => {
        const inf = element.payload.toJSON();
        console.log(inf);
        this.myInfos = inf;
        console.log(this.myInfos);

      });
    });
  }

  openCommentateur(key:any){
    this.modalService.dismissAll();
    this.router.navigate(["/"]);
    this.router.navigate(["/products/userid", key]);
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

  // CONFIRMEZ AVANT DE SUPPRIMER UNE ADRESSE LIVRAISON
  openSm(contentSupp:any, item:any) {
    this.supp = item;
    this.modalService.open(contentSupp, { size: 'sm' });
  }


  likeComment(key:any){
    console.log(key);

    this.firedata.child(this.infoUser).child('comment').child(key).child('like').orderByChild('keycomment').equalTo(key).once('value', (snapshot:any)=>{
        console.log(snapshot.val());


        if (snapshot.val()){
          console.log('il a déjà voté');
        }else{
          console.log('pas');
          this.firedata.child(this.infoUser).child('comment').child(key).child('like').push({
            uid: this.detailUser.uid,
            name: this.detailUser.displayName,
            dejavote: true,
            keycomment: key

          });


        }
        this.firedata.child(this.infoUser).child('comment').child(key).child('like').once('value', (snapshotItem:any) =>{
          console.log(snapshotItem.val())
          for (var i in snapshotItem.val()){
            if(snapshotItem.val()[i].keycomment == key){
              this.listLikeComment.push(snapshotItem.val()[i])
              console.log(this.listLikeComment.length)
            }else{
              this.listLikeComment = [];
            }

          }
          this.nbrLikeComment = this.listLikeComment.length;
        })
      })
    }


    nbrvente(){
      this.nbreVente = 0;
      console.log(this.infoUser)
      this.firedataVente.child(this.infoUser).once('value', (snapshot:any) =>{
        this.tabvente = [];
        console.log(snapshot.val())
        if(snapshot.val()){
          for (var i in snapshot.val()){
            this.tabvente.push(snapshot.val()[i])
            console.log(this.tabvente.length)


        }
        console.log('deja vendu'+ this.tabvente.length +'produits')
        this.nbreVente = this.tabvente.length;
        }else{
          console.log('pas de vente')
          this.nbreVente = 0;
        }
        console.log(this.nbreVente)
      })

      console.log(this.nbreVente)


      //geolocaliser le vendeur sur sa page
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
         this.lat = position.coords.latitude;
         this.lng = position.coords.longitude;
      console.log(this.infoUser)
      firebase.database().ref('/locations').orderByChild('uid').equalTo(this.infoUser).once('value',(snapshot:any) =>{
        console.log(snapshot.val())
        //if(snapshot.val()){
          this.markers = [];
          for (var i in snapshot.val()){
            console.log(snapshot.val()[i].l[0])

            var local = [this.lat, this.lng];
            var lautre = [snapshot.val()[i].l[0], snapshot.val()[i].l[1]];
            this.distance = GeoFire.distance(local, lautre).toFixed(2);
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
        //}else{
        //  console.warn("ce vendeur n'a pas donné sa position")
        //}

        });
      });

    }


    }

    addToCart(product: Product) {
      this.productService.addToCart(product, '');
    }

    addFavourite(product: Product) {
      this.productService.addFavouriteProduct(product);
    }
}
