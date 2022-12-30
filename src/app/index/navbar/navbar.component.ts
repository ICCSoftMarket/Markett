import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../shared/services/auth.service";
import { ProductService } from "../../shared/services/product.service";

//add
import { User } from "../../shared/models/user";
import { AngularFireAuth } from "angularfire2/auth";
import firebase from 'firebase/compat/app'

// import { ProductListComponent } from "src/app/product/product-list/product-list.component";

declare var $: any;

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit {
  infoUser:any;
  infos:any;
  loggedUser!: User;
  users;
  firedata = firebase.database().ref('/category');
  categoryList= [];



  // slides: any = [[]];
  // chunk(arr, chunkSize) {
  //   let R = [];
  //   for (let i = 0, len = arr.length; i < len; i += chunkSize) {
  //     R.push(arr.slice(i, i + chunkSize));
  //   }
  //   console.log("le R est ", R)
  //   return R;
  // }



  constructor(public authService: AuthService, private router: Router, public productService: ProductService,
    private firebaseAuth: AngularFireAuth,
    // private productListComponent : ProductListComponent
  ) {
   // this.infoUser = this.authService.userDetails.uid;
  //  console.log(this.infoUser);

  this.users = firebaseAuth.authState;
  this.users.subscribe((user:any) => {
    if (user) {
      this.infoUser = user.uid;
      this.getInfoUser();
    } else {
      this.infoUser = null;
    }
  });

  }

  ngOnInit() {
    // this.getCateg();

  }
  logout() {
    this.authService.logout();
    this.router.navigate(["/"]);
    this.getInfoUser();
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
        console.log(this.infos.image_profile)
      })
    })
  }


  // getCateg(){
  //   this.firedata.once('value', (snapshot) =>{
  //     this.categoryList = [];
  //     for (var categ in snapshot.val()){
  //       this.categoryList.push(snapshot.val()[categ])
  //     }
  //     console.log("nav", this.categoryList);

  //   })
  // }



  onClick(){
    // let constant = new ProductListComponent()
    // console.log("access a ", this.ProductListComponent.)
  }
}
