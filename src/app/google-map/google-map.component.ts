import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeoService } from '../geo.service'
import * as firebase from "firebase/app";
import * as GeoFire from "geofire";

@Component({
  selector: 'google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss']
})
export class GoogleMapComponent implements OnInit, OnDestroy {

  title: string = 'LOCALISATION DES VENDEUR A PROXIMITE';
  //lat: number = 51.678418;
  //lng: number = 7.809007;

  lat: number;
  lng: number;
  distance: number;

  markers: any;
  subscription: any;
  elMarkers = [];

  constructor(private geo: GeoService) {
    console.log('voici le map');
    console.log(navigator.onLine);
    this.requestPerm();
   // this.seedDatabase();
    //this.geoPerm();

  }

  ngOnInit() {
    this.getUserLocation()
    //console.log(this.geo.hits);
    //this.subscription = this.geo.hits
    //    .subscribe(hits => this.markers = hits)
    //this.markers = this.geo.elMarker;
    //    console.log(this.markers);
  }

  ngOnDestroy() {
  //  this.subscription.unsubscribe()
  }

  private getUserLocation() {
    console.log('get locations');
    //this.geo.getLocations(100, [this.lat, this.lng]);
   /// locate the user
   if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
     this.lat = position.coords.latitude;
     this.lng = position.coords.longitude;

     //this.geo.getLocations(500, [this.lat, this.lng])
     //this.geo.getLocUser();

     firebase.database().ref('/locations').once('value',(snapshot:any) =>{
      console.log(snapshot.val())
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
    })



   });
 }
 }

 getPosition($event:any){
   console.log($event.coords);
 }



requestPerm(){
  Notification.requestPermission(function(result) {
    if (result === 'denied') {
      console.log('Permission wasn\'t granted. Allow a retry.');
      return;
    } else if (result === 'default') {
      console.log('The permission request was dismissed.');
      return;
    }
    console.log('Permission was granted for notifications');
  });
}


  private seedDatabase() {
    let dummyPoints = [
      [37.9, -122.1],
      [38.7, -122.2],
      [38.1, -122.3],
      [38.3, -122.0],
      [38.7, -122.1]
    ]

    dummyPoints.forEach((val, idx) => {
      let name = `dummy-location-${idx}`
      console.log(idx)
      //this.geo.setLocation(name, val)
    })
  }

}
