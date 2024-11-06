import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, debounceTime, filter, map, Observable, of} from "rxjs";
import {AbstractControl, AsyncValidatorFn, ValidationErrors} from "@angular/forms";
import {Order} from "../models/order";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly client = inject(HttpClient);
  private readonly url:string = 'http://localhost:3000/orders';

  validEmail(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      const email = control.value;
      const finalURL = `${this.url}?email=${email}`;

      return this.client.get<Order[]>(finalURL).pipe(
        debounceTime(300),
        map(orders => {

          const yesterday = Date.now() - (24 * 60 * 60 * 1000);

          const recentOrders = orders.filter(order => {

            const orderTime = parseInt(order.timestamp);
            return orderTime > yesterday;
          });

          console.log('Órdenes en las últimas 24h:', recentOrders.length);

          return recentOrders.length >= 3
            ? { orderLimit: 'Usuario ha excedido el límite de 3 órdenes en 24 horas' }
            : null;
        }),
        catchError(error => {
          console.error('Error validando órdenes:', error);
          return of({ serverError: 'Error al validar órdenes' });
        })
      );
    };
  }

/*  validEmail() : AsyncValidatorFn{
    return (control:AbstractControl):Observable<ValidationErrors | null> =>{
      const email = control.value;
      const finalURL = this.url+"?email="+email;
      console.log(finalURL)
      return this.client.get<Order[]>(finalURL).pipe(
        map((orderList) => orderList.filter((order) => this.lessThan24Hours(order.timestamp))),
        map((recentOrders) => (recentOrders.length >= 3 ? { orderLimit: true } : null)),
        catchError(() => of(null)),
      debounceTime(300)
      );
    }
  }
  private lessThan24Hours(timestamp:string):boolean {
    const date = new Date(timestamp);
    const dateNow = Date.now();
    const diff = dateNow - date.getTime();
    const day = 24*60*60*1000;
    return diff < day;
  }*/

  postOrder(order: Order): Observable<Order> {
    return this.client.post<Order>(this.url, order);
  }

  get orders(): Observable<Order[]> {
    return this.client.get<Order[]>(this.url);
  }
}
