import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, filter, map, Observable, of} from "rxjs";
import {AbstractControl, AsyncValidatorFn, ValidationErrors} from "@angular/forms";
import {Order} from "../models/order";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly client = inject(HttpClient);
  private readonly url:string = 'http://localhost:3000/orders';

  validEmail() : AsyncValidatorFn{
    return (control:AbstractControl):Observable<ValidationErrors | null> =>{
      const email = control.value;
      const finalURL = this.url+"?email="+email;
      console.log(finalURL)
      return this.client.get<Order[]>(finalURL).pipe(
        map((orderList) => orderList.filter((order) => this.lessThan24Hours(order.timestamp))),
        map((recentOrders) => (recentOrders.length > 1 ? { orderLimit: true } : null)),
        catchError(() => of(null))
      );
    }
  }
/*
    const orders = this.client.get<Order[]>(finalURL);
    const $recentOrders = orders.pipe(map(orderList =>
      orderList.filter(order => this.lessThan24Hours(order.timestamp))))
    let recentOrders =[];
    $recentOrders.subscribe(orders => {recentOrders = orders;});
    return of(recentOrders.length > 3 ? {limitOrders:true}:null)
*/



  private lessThan24Hours(timestamp:string):boolean {
    const date = new Date(timestamp);
    const dateNow = Date.now();
    const diff = dateNow - date.getTime();
    const day = 24*60*60*1000;
    return diff < day;
  }

  postOrder(order: Order): Observable<Order> {
    return this.client.post<Order>(this.url, order);
  }

  get orders(): Observable<Order[]> {
    return this.client.get<Order[]>(this.url);
  }
}
