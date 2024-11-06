import {Component, inject, OnInit} from '@angular/core';
import {OrderService} from "../services/order.service";
import {Order} from "../models/order";
import {DatePipe} from "@angular/common";
import {routes} from "../app.routes";
import {Router} from "@angular/router";

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    DatePipe
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
private readonly order_service:OrderService = inject(OrderService);
private readonly router:Router = inject(Router);
orders:Order[] = [];


ngOnInit(): void {
  this.getOrders();
  }

getOrders() {
  this.order_service.orders.subscribe(orderList => {
    this.orders = orderList
  })
  }


  protected readonly routes = routes;

  newOrder() {
    this.router.navigate(['/create-order']);
  }
}
