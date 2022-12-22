
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import * as GeoFire from "geofire";
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { FirebaseApp } from 'angularfire2';
import * as firebase from "firebase/app";
import { LoaderSpinnerService } from "./shared/loader-spinner/loader-spinner";
import { Cart } from "./shared/models/cart";
//import GeoFire = require('geofire');

@Injectable()
export class GeoService {

  dbRef: any;
  geoFire: any;
  elMarker = [];

  hits = new BehaviorSubject([])

  constructor(private db: AngularFireDatabase, private fb: FirebaseApp, private spinnerService: LoaderSpinnerService) {
    /// Reference database location for GeoFire
    //this.dbRef = fb.database().ref('/locations');
    this.dbRef = firebase.database().ref('/locations');
    //this.dbRef = this.db.list('/locations');
    this.geoFire = new GeoFire(this.dbRef); //.$ref
    console.log(this.geoFire.ref());

    //this.dbRef = this.db.list("locations", ref =>
    //this.geoFire = new GeoFire(ref));
    console.log(this.geoFire);
    //console.log(this.dbRef);



   }



   /// Adds GeoFire data to database
   setLocation(key:string, coords: Array<number>, tof:any, name:any, telephone:any, description:any) {
     this.geoFire.set(key, coords)
         .then((_:any) => console.log('location updated'))
         .catch((err:any) => console.log(err))
         firebase.database().ref('/locations').child(key).update({
           uid: key,
           photo: tof,
           name: name,
           tel: telephone,
           description: description
         })

   }


   /// Queries database for nearby locations
   /// Maps results to the hits BehaviorSubject
   getLocations(radius: number, coords: Array<number>) {
    var geo = this.geoFire.query({
      center: coords,
      radius: radius
    })

    var location1 = [10.3, -55.3];
    var location2 = [-78.3, 105.6];

    var distance = GeoFire.distance(location1, location2);  // distance === 12378.536597423461

    console.log(distance);

    geo.on('key_entered', (key:any, location:any, distance:any) => {
      console.log(key + " entered query at " + location + " (" + distance + " km from center)");
      let hit = {
        location: location,
        distance: distance
      }
      let currentHits = this.hits.value
      currentHits.push(hit)
      this.hits.next(currentHits)

    });
   }

}
