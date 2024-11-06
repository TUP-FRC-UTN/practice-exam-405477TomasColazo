import {FormGroup} from "@angular/forms";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}
export interface ProductDetail {
  id: string;
  formGroup: FormGroup;
}
