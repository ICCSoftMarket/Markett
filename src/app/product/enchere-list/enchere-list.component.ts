import { Component, OnInit } from "@angular/core";
import { Product } from "../../shared/models/product";
import { AuthService } from "../../shared/services/auth.service";
import { ProductService } from "../../shared/services/product.service";
import { LoaderSpinnerService } from "../../shared/loader-spinner/loader-spinner";

//add
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgForm, FormBuilder, FormGroup, Validators } from "@angular/forms";
import firebase from 'firebase/compat/app'
import { AngularFireAuth } from "angularfire2/auth";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { ToastOptions, ToastyService, ToastyConfig } from "ng2-toasty";

@Component({
  selector: "app-enchere-list",
  templateUrl: "./enchere-list.component.html",
  styleUrls: ["./enchere-list.component.scss"]
})
export class enchereListComponent implements OnInit {
  enchereList!: Product[];
 clotureList!: Product[];
  enchereId!: Product[];
  user: Observable<firebase.User>;
  categoryList: any[] = [];
  segment: string = 'vetement_homme';
  selectedSegment: string = this.segment;
  dateDeLenchere:any;
  date_actuelle:any;
  date_evenement:any;
  minutes:any;
  heures:any;
  jours:any;
  secondes:any;
  data = {};
  dataOffre = {};
  firedata = firebase.database().ref('/enchere');
  firedataOrder = firebase.database().ref('/orders');
  infoUser:any;
  infos:any;
  enchere:any;
  max:any;
  objetCateg = {};
  brands = ["All", "Google", "Apple", "Samsung", "OnePlus", "Lenovo", "Nokia", "Motorolla"];

  selectedBrand!: "All";
  searchText:any;
  firedataCateg = firebase.database().ref('/category');

  page = 1;
  categ:any;
  searchAmount:any;
  searchAmountmin:any;
  paysList: any[] = [];

  slides: any = [[]];
  chunk(arr:any, chunkSize:any) {
    let R = [];
    for (let i = 0, len = arr.length; i < len; i += chunkSize) {
      R.push(arr.slice(i, i + chunkSize));
    }
    console.log("le R est ", R)
    return R;
  }

  constructor(private toastyService: ToastyService, private toastyConfig: ToastyConfig,
    public authService: AuthService, private firebaseAuth: AngularFireAuth,
    private productService: ProductService, private router: Router,
    private spinnerService: LoaderSpinnerService,
    config: NgbModalConfig, private modalService: NgbModal,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    //this.infoUser = this.authService.userDetails.uid;
    this.user = firebaseAuth.authState;
    this.user.subscribe(user => {
      if (user) {
        this.infoUser = user.uid;
        console.log(this.infoUser);
      } else {
        this.infoUser = null;
      }
    });
  }

  ngOnInit() {
    this.getAllencheres();
    this.getCateg();
    //this.getAllCategory();
    this.getAllPays()
  }

  open(content:any, data:any) {
    this.data = data;

    if(this.infoUser){
      this.modalService.open(content);
    }else {
      alert('Vous devez vous connecter pour faire une offre')
      this.router.navigate(["/index/login"]);
    }
  }


  // paysFunction(pays){

  //   const x = this.productService.getUsers(this.infoUser);
  //   x.snapshotChanges().subscribe(use => {
  //     use.forEach(element => {
  //       const inf = element.payload.toJSON();
  //       this.infos = inf;
  //       // console.log(this.infos)
  //       // console.log(this.infos.country)
  //       // console.log(pays)
  //       if(pays == 'mon'){
  //         const x = this.productService.getEnchereByPays(this.infos.country);
  //         x.snapshotChanges().subscribe(pro => {
  //           this.enchereList = [];
  //           pro.forEach(element => {
  //             const y = element.payload.toJSON();
  //             y["$key"] = element.key;
  //             // console.log(y["$key"]);
  //             this.enchereList.push(y as Product);
  //           });
  //         });
  //       }else{
  //         this.spinnerService.show();
  //         const x = this.productService.getEcheres();
  //         x.snapshotChanges().subscribe(product => {
  //           this.spinnerService.hide();
  //           this.enchereList = [];
  //           product.forEach(element => {
  //             const y = element.payload.toJSON();
  //             y["$key"] = element.key;
  //             this.enchereList.push(y as Product);
  //             console.log(this.enchereList);
  //           });
  //         });
  //       }
  //     });
  //   });

  // }
  paysFunction(pays:any){
    console.log("mon log pays", pays)
    if(!pays){
      this.spinnerService.show();
        const x = this.productService.getEcheres();
        // console.log(x);
        x.snapshotChanges().subscribe((product:any) => {
          this.spinnerService.hide();
          this.enchereList = [];
          product.forEach((element:any) => {
            const y = element.payload.toJSON();
            y["$key"] = element.key;

            // console.log(this.productList);
            if(this.categ){
              if(y["category"] == this.categ){
                this.enchereList.push(y as Product);
              }
            }else{
              this.enchereList.push(y as Product);
            }
          });
        });
    }else{
      this.spinnerService.show();
      const x = this.productService.getEnchereByPays(pays);
      x.snapshotChanges().subscribe((pro:any) => {
        this.spinnerService.hide();
        this.enchereList = [];
        pro.forEach((element:any) => {
          const y = element.payload.toJSON();
          y["$key"] = element.key;
          // console.log(y["$key"]);
          // this.enchereList.push(y as Product);
          if(this.categ){
            if(y["category"] == this.categ){
              this.enchereList.push(y as Product);
            }
          }else{
            this.enchereList.push(y as Product);
          }
        });
      });
    }


  }

  //AJOUTER UNE ADRESSE DE LIVRAISON
  offreEnchere(offreForm: NgForm, data:any) {

    // console.log(data);
    // console.log(data.$key);
    // console.log(offreForm.value["montant"]);
    this.enchere = offreForm.value["montant"];
    const x = this.productService.getUsers(this.infoUser);
    // console.log(x);
    x.snapshotChanges().subscribe((use:any) => {
      // console.log(use);
      use.forEach((element:any) => {
        const inf = element.payload.toJSON();
        // console.log(inf);
        this.infos = inf;
        // console.log(this.enchere);
        this.firedata.child(data.$key).child("offres").push({

          montant_enchere: this.enchere,
          country: data.country,
          date_commande: new Date().toISOString(),
          idacheteur: this.infoUser,
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

  getMaxOffre(id:any){
    var tab = [];
    for (var key in this.enchereList){
      if (this.enchereList[key].$key == id){
        for (var m in this.enchereList[key]["offres"]){
          tab.push(this.enchereList[key]["offres"][m].price);
          //console.log(Math.max(...tab));

        }
      }

    }
    this.max = Math.max(...tab);
    return this.max;
  }

  //cloturer
  cloture(id:any){
    var tab = [];
    for (var key in this.enchereList){
      if (this.enchereList[key].$key == id){
        for (var m in this.enchereList[key]["offres"]){
          tab.push(this.enchereList[key]["offres"][m].price);
          //console.log(Math.max(...tab));

        }
      }

    }
    this.max = Math.max(...tab);
    console.log(this.max);
    console.log(id);

    const x = this.productService.getEnchereId(this.max, id);
    x.snapshotChanges().subscribe((product:any) => {
      this.spinnerService.hide();
      this.clotureList = [];
      product.forEach((element:any) => {
        const y = element.payload.toJSON();
        console.log(y);
        console.log(y["country"]);
        console.log(y["name_img"]);

        this.firedataOrder.push({

              //Product data is hardcoded for simplicity
              product_name: y["name"],
              product_price: y["montant_enchere"],
              product_image: y["image"],
              product_id: id,
              idvendeur: y["idvendeur"],
              name_img: y["name_img"],

              //item data
              item_qty: '1',

              //Order data
              user_id: y["idacheteur"],
              user_name:y["nomvendeur"],
              user_acheteur:y["nomacheteur"],
              user_phone:y["telephone_acheteur"],
              user_quartier:y["quartier_acheteur"],
              message: 'Meilleure offre aux enchères',
              //address_id: address,
              payment_id: 'COD',
              date_commande: new Date().toISOString(),
              status: "En Attente"

            });

          //FIN
          this.firedata.child(id).remove();
      });
    });
    const toastOption: ToastOptions = {
      title: "Clorure de la vente",
      msg: "générer une commande",
      showClose: true,
      timeout: 1000,
      theme: "material"
    };
    this.toastyService.wait(toastOption);
    setTimeout(() => {
      //localStorage.setItem("cartsss_item", JSON.stringify(a));
    }, 500);
  }

  getAllencheres() {
    this.spinnerService.show();
    const x = this.productService.getEcheres();
    x.snapshotChanges().subscribe((product:any) => {
      this.spinnerService.hide();
      this.enchereList = [];
      product.forEach((element:any) => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.enchereList.push(y as Product);
        console.log(this.enchereList);
      });
    });
  }


  getEncheresateg(categ:any) {
    this.spinnerService.show();
    const x = this.productService.getEnchereByCateg(categ);
    x.snapshotChanges().subscribe((product:any) => {
      this.spinnerService.hide();
      this.enchereList = [];
      product.forEach((element:any) => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.enchereList.push(y as Product);
        console.log(this.enchereList);
      });
    });
  }

  getCateg(){
    this.firedataCateg.once('value', (snapshot:any) =>{

      for (var categ in snapshot.val()){
        this.categoryList.push(snapshot.val()[categ])
      }
      // console.log(this.categoryList);
      this.slides = this.chunk(this.categoryList, 6);
    })
  }

  getAllCategory() {
    this.spinnerService.show();
    const x = this.productService.getCategories();
    x.snapshotChanges().subscribe((categ:any) => {
      this.spinnerService.hide();
      this.categoryList = ["All"];
      console.log(this.categoryList);
      console.log(categ);
      categ.forEach((element:any) => {
        const y = element.payload.toJSON();
        console.log(y);
        this.objetCateg = element.payload.toJSON();
        console.log(this.objetCateg);
        y["$key"] = element.key;
        this.categoryList.push(y["code"]);
        console.log(this.categoryList);
      });
    });
  }


  // DEBUT COMPTE A REBOURS

  compte_a_rebour(id:any){
    //console.log(id);
    var compte_a_rebours;
    //LISTE DES PRODUITS AUX ENCHERE
    for (var key in this.enchereList){
      //console.log(this.enchereList[key].$key);
      if(this.enchereList[key].$key == id){
        this.dateDeLenchere = this.enchereList[key]["date_enchere"];
      }
    }
    //console.log(this.dateDeLenchere);

    //var test = new Date().getTime();
      this.date_actuelle = new Date();
      //var date_evenement = new Date("jul 27 13:44:00 2018");
      this.date_evenement = new Date(this.dateDeLenchere);
      //var date_actu = (date_actuelle * 100);
      var total_secondes = Math.round((this.date_evenement - this.date_actuelle) / 1000);

     // console.log(total_secondes);

      var prefixe = "Reste ";
      //console.log(total_secondes);


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

          //console.log($scope.compte_a_rebour);
          //setInterval($scope.compte_a_rebour, 1000);
          compte_a_rebours = prefixe + this.jours + ' ' + mot_jour + ' ' + this.heures + ' ' + mot_heure + ' ' + this.minutes + ' ' + mot_minute + ' ' + this.secondes + ' ' + mot_seconde;

      }

      if(total_secondes == 0)
      {
          compte_a_rebours = 'Compte à rebours terminé r.';

      }
      //setTimeout(this.compte_a_rebour(id),1000);
      //setInterval(this.compte_a_rebour(id), 1000);
      return compte_a_rebours;
  };




  removeProduct(key: string, name:any) {
    console.log(name)
    console.log(key)
    this.firedata.child(key).remove();
    //this.productService.deleteProduct(key);
    this.deleteFileStorage(name);
  }

  //SUPPRIMER UN PRODUIT
 private deleteFileStorage(name:string) {
  let storageRef = firebase.storage().ref();
  storageRef.child('images/'+ name ).delete()
}

  addFavourite(product: Product) {
    this.productService.addFavouriteProduct(product);
  }

  addToCart(product: Product) {
    this.productService.addToCart(product, '');
  }


  brandFunction(brand:any){
    this.selectedBrand = brand;
    console.log(this.selectedBrand);
  }

  //recherche des pays
  getAllPays() {
    const x = this.productService.getPays();
    x.snapshotChanges().subscribe((categ:any) => {
      categ.forEach((element:any) => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        // console.log("yyy", y)
        this.paysList.push(y);
      });
    });
  }
}
