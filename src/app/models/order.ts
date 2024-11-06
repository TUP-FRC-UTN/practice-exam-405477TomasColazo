import {Product} from "./product";

export interface Order {
  id:string;
  customerName:string;
  email:string;
  products:ProductDetails[];
  total:number;
  orderCode:string;
  timestamp:string;
}
interface ProductDetails {
  productId:string;
  quantity:number;
  stock:number;
  price:number;
}
