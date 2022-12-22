import { Component, OnInit } from "@angular/core";

//add
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-billing-details",
  templateUrl: "./billing-details.component.html",
  styleUrls: ["./billing-details.component.scss"]
})
export class BillingDetailsComponent implements OnInit {

  private sub: any;
  payments = [
    {id: 'CREDIT', name: 'Credit Card'},
    {id: 'NETBANK', name: 'Orange Money'},
    {id: 'COD', name: 'Commande'}
  ];
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {

    this.sub = this.route.params.subscribe(params => {
      const id = params["id"]; // (+) converts string 'id' to a number
      console.log(id);
    });
  }
}
