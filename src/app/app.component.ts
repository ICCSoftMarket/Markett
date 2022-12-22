import { Component, OnInit } from "@angular/core";
import { UserService } from "./shared/services/user.service";
import { fadeAnimation } from "./shared/animations/fadeIntRoute";

import { ProductService } from "./shared/services/product.service";
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
declare var $: any;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  animations: [fadeAnimation]
})
export class AppComponent implements OnInit {
  title = "app";
  firedata = firebase.database().ref('/category');
  categoryList: any[] = [];

  constructor(private userService: UserService,private productService: ProductService,private firebaseAuth: AngularFireAuth) {}

  ngOnInit() {
    $(document).ready(function() {
      $(".banner").owlCarousel({
        autoHeight: true,
        center: true,
        nav: true,
        items: 1,
        margin: 30,
        loop: true,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true
      });
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setGeoLocation.bind(this));
    }

  //  this.firebaseAuth.authState.subscribe(user => {
  //    if (user) {
  //      console.log(user);
  //      this.productService.calculateCartProductCounts();
  //    }
  //  });
    this.fetCateg();
  }

  setGeoLocation(position: any) {
    this.userService.setLocation(
      position["coords"].latitude,
      position["coords"].longitude
    );
  }


  //tchat bot
  openForm() {
    console.log('dedan dedan')
    document.getElementById("myForm").style.display = "block";
  }

  closeForm() {
    document.getElementById("myForm").style.display = "none";
  }


  fetCateg(){
    this.firedata.once('value', (snapshot:any) =>{

      for (var categ in snapshot.val()){
        this.categoryList.push(snapshot.val()[categ])
      }
      console.log(this.categoryList);
    })
  }


}
