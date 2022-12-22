import { NgForm, EmailValidator } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { ToastyService, ToastOptions, ToastyConfig } from "ng2-toasty";
import { Router, ActivatedRoute } from "@angular/router";
import { UserService } from "../../shared/services/user.service";
import { AuthService } from "../../shared/services/auth.service";
import { User } from "../../shared/models/user";

//ajoute
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from "firebase/app";
import { LoaderSpinnerService } from "../../shared/loader-spinner/loader-spinner";
import { ProductService } from "../../shared/services/product.service";
import { GeoService } from '../../geo.service'

declare var $: any;
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  providers: [EmailValidator]
})
export class LoginComponent implements OnInit {
  user = {
    emailId: "",
    loginPassword: ""
  };

  errorInUserCreate = false;
  errorMessage: any;
  createUser;
  firedata = firebase.database().ref('/users');
  paysList= [];
  uid:any;
  latUser: number;
  lngUser: number;

  constructor(
    private authService: AuthService,private toastyService: ToastyService,private router: Router,
    private route: ActivatedRoute,private toastyConfig: ToastyConfig,private firebaseAuth: AngularFireAuth,
    private spinnerService: LoaderSpinnerService,private productService: ProductService,private geo: GeoService
  ) {
    this.toastyConfig.position = "top-right";
    this.toastyConfig.theme = "material";

    this.createUser = new User();
  }

  ngOnInit() {
    this.getAllPays();
  }

  addUser(userForm: NgForm) {
    const user = this.firebaseAuth.auth.currentUser;
    console.log(user);
    userForm.value["isAdmin"] = false;
    this.authService.createUserWithEmailAndPassword(
        userForm.value["emailId"],
        userForm.value["password"]
      ).then((res:any) => {
        res.updateProfile({
          displayName: userForm.value["nameId"],
          phoneNumber: userForm.value["telephoneId"],
          photoURL: "https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/profiles%2Fmale-shadow-circle-512.png?alt=media&token=166265ad-ce79-400a-b592-5156634392ba"
        });
        console.log(res);
        this.firedata.child(res.uid).set({
          uid: res.uid,
          name: userForm.value["nameId"],
          image_profile: 'https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/profiles%2Fmale-shadow-circle-512.png?alt=media&token=166265ad-ce79-400a-b592-5156634392ba',
          telephone: userForm.value["telephoneId"],
          ville: userForm.value["villeId"],
          quartier: userForm.value["quartierId"],
          country: userForm.value["paysId"],
          vendeur: userForm.value["vendeurId"],
          description: userForm.value["description"]
        });

          navigator.geolocation.getCurrentPosition(position => {
           this.latUser = position.coords.latitude;
           this.lngUser = position.coords.longitude;
           var tof = 'https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/profiles%2Fmale-shadow-circle-512.png?alt=media&token=166265ad-ce79-400a-b592-5156634392ba';
           console.log(res.displayName)
           console.log(userForm.value["telephoneId"])
           console.log(userForm.value["description"])
           this.geo.setLocation(res.uid, [this.latUser, this.lngUser], tof, res.displayName, userForm.value["telephoneId"], userForm.value["description"]);
          });


        console.log("created User", res);
        const toastOption: ToastOptions = {
          title: "Création de l'utilisateur",
          msg: "Utilisateur créé",
          showClose: true,
          timeout: 3000,
          theme: "material"
        };
        this.toastyService.wait(toastOption);
        setTimeout((router: Router) => {
          $("#createUserForm").modal("hide");
          this.productService.updateCartOnligne();
          this.router.navigate(["/"]);
        }, 1500);
      }).catch((err:any) => {
        this.errorInUserCreate = true;
        this.errorMessage = err;
        const toastOption: ToastOptions = {
          title: "Création a échoué",
          msg: "Vérifier vos informations",
          showClose: true,
          timeout: 25000,
          theme: "material"
        };
        this.toastyService.error(toastOption);
      });
      //this.productService.calculateCartProductCounts();
  }

  signInWithEmail(userForm: NgForm) {
    this.authService
      .signInRegular(userForm.value["emailId"], userForm.value["loginPassword"])
      .then((res:any) => {
        console.log("Logged In: ", res);

        const toastOption: ToastOptions = {
          title: "Authentication Success",
          msg: "Logging in please wait",
          showClose: true,
          timeout: 5000,
          theme: "material"
        };
        this.toastyService.wait(toastOption);

        const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
        setTimeout((router: Router) => {
          this.router.navigate([returnUrl || "/"]);
          this.productService.updateCartOnligne();
        }, 1500);
        this.router.navigate(["/"]);
      })
      .catch((err:any) => {
        console.log("logging Error: ", err);
        const toastOption: ToastOptions = {
          title: "Authentication a échoué",
          msg: "Vérifier vos informations",
          showClose: true,
          timeout: 25000,
          theme: "material"
        };
        this.toastyService.error(toastOption);
        const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
        this.router.navigate([returnUrl]);
      });
      const toastOption: ToastOptions = {
        title: "Authentication",
        msg: "patientez s'il vous plait",
        showClose: true,
        timeout: 5000,
        theme: "material"
      };
      this.toastyService.wait(toastOption);
      setTimeout(() => {
        //localStorage.setItem("cartsss_item", JSON.stringify(a));
        //this.productService.updateCartOnligne();
        this.router.navigate(["/"]);
      }, 500);
      //this.productService.calculateCartProductCounts();
  }

  signInWithGoogle() {
    this.authService.signInWithGoogle().then((res:any) => {
      this.uid = res.user.uid;
      console.log(this.uid);
      const x = this.productService.getUsers(this.uid);
      console.log(x);
      x.snapshotChanges().subscribe((use:any) => {
        console.log(use);
        if(use.length == 0) {
            console.log('le element ne existe pas');
            console.log(this.firedata);
            var tof = 'https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/profiles%2Fmale-shadow-circle-512.png?alt=media&token=166265ad-ce79-400a-b592-5156634392ba';
            this.firedata.child(this.uid).set({
              uid: this.uid,
              name: res.user.displayName,
              image_profile: 'https://firebasestorage.googleapis.com/v0/b/shopping-8abd0.appspot.com/o/profiles%2Fmale-shadow-circle-512.png?alt=media&token=166265ad-ce79-400a-b592-5156634392ba',
              email: res.user.email
            });

            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(position => {
               this.latUser = position.coords.latitude;
               this.lngUser = position.coords.longitude;
               this.geo.setLocation(this.uid, [this.latUser, this.lngUser], tof, res.user.displayName, '', '');
              });
            }
          }
      });


        this.router.navigate(["index"]);
      })
      .catch((err:any) => console.log(err));
      const toastOption: ToastOptions = {
        title: "Authentication",
        msg: "patientez s'il vous plait",
        showClose: true,
        timeout: 5000,
        theme: "material"
      };
      this.toastyService.wait(toastOption);
      setTimeout(() => {
        //localStorage.setItem("cartsss_item", JSON.stringify(a));
        //this.productService.calculateCartProductCounts();
        this.router.navigate(["index"]);
        this.productService.updateCartOnligne();
      }, 500);
     // this.productService.calculateCartProductCounts();
  }

  //recherche des pays
  getAllPays() {
    this.spinnerService.show();
    const x = this.productService.getPays();
    x.snapshotChanges().subscribe((categ:any) => {
      this.spinnerService.hide();
      //this.productList = ["All"];
      console.log(this.paysList);
      console.log(categ);
      categ.forEach((element:any) => {
        const y = element.payload.toJSON();
        console.log(y);
        y["$key"] = element.key;
        this.paysList.push(y);
        console.log(this.paysList);
      });
    });
  }
}
