import { Component, OnInit } from "@angular/core";
import { AuthService } from "../shared/services/auth.service";

//add
import { LoaderSpinnerService } from "../shared/loader-spinner/loader-spinner";
import { AngularFireAuth } from "angularfire2/auth";
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject
} from "angularfire2/database";
import { Cart } from "../shared/models/cart";
import { ProductService } from "../shared/services/product.service";
import { Product } from "../shared/models/product";
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgForm, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastOptions, ToastyService, ToastyConfig } from "ng2-toasty";
import firebase from 'firebase/compat/app'
import {Commentaire} from "../shared/models/user";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"]
})
export class UserComponent implements OnInit {

  nbrLike:any;
  nbrNoLike:any;
  nbrcomment:any;
  users;
  infoUser:any;
  listLike: Cart[] = [];
  listNoLike: Cart[] = [];
  listComment: Cart[] = [];
  orderList!: Product[];
  nbreOrderClient:any;

  orderListMy!: Product[];
  nbreOrderMy:any;
  infos:any;
  firedata = firebase.database().ref('/users');
  data:Commentaire = new Commentaire();

  openCommentateur:any;


  constructor(public authService: AuthService, private spinnerService: LoaderSpinnerService, private firebaseAuth: AngularFireAuth,
    private db: AngularFireDatabase,private productService: ProductService,private modalService: NgbModal,
    private toastyConfig: ToastyConfig,private toastyService: ToastyService) {

    this.users = firebaseAuth.authState;
    this.users.subscribe((user:any) => {
      if (user) {
        //this.infoUser = user;
        this.infoUser = user.uid;

      } else {
        //this.infoUser = null;
      }
    });
  }

  ngOnInit() {
    this.getInfoUser();
    this.nobreVote();
    this.nobreNoVote();
    this.nobreComment();
    this.getProductOrderClient();
    this.getProductOrderMy();
  }



  ///objet du user connecté
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
      });
    });

}
  //*******************DONNEZ DES LIKE */


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
          console.log(this.listLike);
          this.firedata.child(this.infoUser).update({nbrlike: this.nbrLike})
        });
      });
    }
    //********************DONNEZ DES NOLIKE */


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
            console.log(this.listNoLike);
            this.firedata.child(this.infoUser).update({nbrnolike: this.nbrNoLike})
          });
        });
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
        this.firedata.child(this.infoUser).update({nbrcomment: this.nbrcomment})
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

        this.firedata.child(this.infoUser).child('comment').push({
          uid: this.infoUser,
          name: this.infos.name,
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


  getProductOrderClient(){
    const x = this.productService.getProductOrderClient(this.infoUser);
    x.snapshotChanges().subscribe((pro:any) => {
      this.orderList = [];
      pro.forEach((element:any) => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.orderList.push(y as Product);
        this.nbreOrderClient = this.orderList.length;


      });
    });
  }


  getProductOrderMy(){
    const x = this.productService.getProductOrderMy(this.infoUser);
    x.snapshotChanges().subscribe((pro:any) => {
      this.orderListMy = [];
      pro.forEach((element:any) => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.orderListMy.push(y as Product);
       this.nbreOrderMy = this.orderListMy.length;

      });
    });
  }

}
