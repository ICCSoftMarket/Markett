import { Component, OnInit } from "@angular/core";

//mes import
import{ ProductService} from "../shared/services/product.service";
import { LoaderSpinnerService } from "../shared/loader-spinner/loader-spinner";
import { Product } from "../shared/models/product";

@Component({
  selector: "app-index",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.scss"]
})

export class IndexComponent implements OnInit {
  mesProduits:any;
  productList: Product[];
  constructor(private productService: ProductService,private spinnerService: LoaderSpinnerService) {

  }

  ngOnInit() {

   this.getAllProducts();
  }

  getAllProducts() {
    this.spinnerService.show();
    const x = this.productService.getProducts();
    x.snapshotChanges().subscribe((product:any) => {
      this.spinnerService.hide();
      this.productList = [];
      product.forEach((element:any) => {
        const y = element.payload.toJSON();
        y["$key"] = element.key;
        this.productList.push(y as Product);
      });
    });
  }
}
