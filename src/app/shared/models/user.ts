export class User {
  $key!: string;
  userName!: string;
  emailId!: string;
  password!: string;
  location!: { lon: null; lat: null };
  phoneNumber!: string;
  createdOn!: string;
  isAdmin!: boolean;
  avatar!: string;
}

export class UserDetail {
  $key!: string;
  firstName!: string;
  lastName!: string;
  userName!: string;
  emailId!: string;
  address1!: string;
  address2!: string;
  country!: string;
  state!: string;
  zip!: number;
  pin!:string;
  quartier!:string;
  nickname!:string;
  phone!:string;
  address!:string;
  $id!:string;
}
export class Commentaire {
  commentaire!: string;
  date!: string;
  comment!: string;
  name!: string;

}
