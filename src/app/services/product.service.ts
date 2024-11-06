import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Product} from "../models/product";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
   private readonly client = inject(HttpClient);
   private readonly url:string = 'http://localhost:3000/products';

   get products(): Observable<Product[]> {
     return this.client.get<Product[]>(this.url);
   }

   getProductById(id:string): Observable<Product> {
     return this.client.get<Product>(`${this.url}/${id}`);
   }

}
