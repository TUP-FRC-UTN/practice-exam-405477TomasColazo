import {RouterModule, Routes} from '@angular/router';
import {NgModule} from "@angular/core";
import {NewOrderComponent} from "./new-order/new-order.component";
import {OrderListComponent} from "./order-list/order-list.component";

export const routes: Routes = [
  {path:'',component: NewOrderComponent},
  {path:'create-order',component: NewOrderComponent},
  {path:'orders', component: OrderListComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppModule { }
