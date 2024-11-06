import {Component, inject, OnInit} from '@angular/core';
import {OrderService} from "../services/order.service";
import {Order} from "../models/order";
import {DatePipe} from "@angular/common";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  private readonly order_service:OrderService = inject(OrderService);
  private readonly router:Router = inject(Router);
  orders:Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm: string = '';


  ngOnInit(): void {
    this.getOrders();
    }

  getOrders() {
    this.order_service.orders.subscribe(orderList => {
      this.orders = orderList;
      this.filteredOrders = orderList;
    })
  }

  filterOrders(){
    const search = this.searchTerm.toLowerCase().trim();
    if(!search){
      this.filteredOrders = this.orders;
      return;
    }

    this.filteredOrders = this.orders.filter(order =>
      order.customerName.toLowerCase().includes(search) ||
        order.email.toLowerCase().includes(search)
    );
  }

  newOrder() {
    this.router.navigate(['/create-order']);
  }
}
