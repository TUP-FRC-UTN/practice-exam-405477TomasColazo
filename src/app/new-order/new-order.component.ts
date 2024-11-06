import {Component, inject, OnInit} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {Product,ProductDetail} from "../models/product";
import {ProductService} from "../services/product.service";
import {CommonModule, NgClass} from "@angular/common";
import {atLeastOneProduct, duplicates, lessThan10Products, moreThanStock} from "../validations/validators";
import {OrderService} from "../services/order.service";
import {Order} from "../models/order";
import {Router} from "@angular/router";

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    CommonModule,
  ],
  templateUrl: './new-order.component.html',
  styleUrl: './new-order.component.css'
})
export class NewOrderComponent implements OnInit {
  private readonly product_service: ProductService = inject(ProductService);
  private readonly order_service:OrderService = inject(OrderService);
  private readonly router:Router = inject(Router);
  $products!: Product[];
  productDetails: ProductDetail[] = []
  ngOnInit(): void {
    this.product_service.products.subscribe(products => {
      this.$products = products;
    })
    this.newOrderForm.get('email')?.statusChanges.subscribe(status => {
      console.log('Email status:', status);
      console.log('Email errors:', this.newOrderForm.get('email')?.errors);
    });
  }
  newOrderForm = new FormGroup({
    name: new FormControl('', [Validators.required,Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email], [this.order_service.validEmail()],),
    products: new FormArray([],[duplicates,atLeastOneProduct,lessThan10Products]),
  },{updateOn:"blur"})

  get details(): FormArray {
    return this.newOrderForm.get('products') as FormArray;
  }

  getFormErrors(): string[] {
    const errors: string[] = [];

    if (this.newOrderForm.get('products')?.hasError('noProductFound')) {
      errors.push('Debe agregar al menos un producto al pedido');
    }

    if (this.newOrderForm.get('products')?.hasError('maxTotalQuantity')) {
      errors.push(`La cantidad total de productos no puede superar las 10 unidades`);
    }

    if (this.newOrderForm.get("products")?.hasError("duplicated")){
      errors.push(`No puede haber productos repetidos en la orden`);
    }

    console.log(errors);
    return errors;
  }

  newDetail(){
    this.newOrderForm.controls["products"].markAsTouched();
    const fb = new FormGroup({
      productName: new FormControl('', [Validators.required]),
      quantity: new FormControl(1, [Validators.required,Validators.pattern(/^[0-9]*$/),Validators.min(1),moreThanStock]),
      price: new FormControl(0),
      stock: new FormControl(0),
    })

    fb.get('stock')?.valueChanges.subscribe(() => {
      fb.get('quantity')?.updateValueAndValidity();
    });


    fb.get("productName")?.valueChanges.subscribe(productId => {
      const selectedProduct = this.$products.find(product => product.id === productId);
      if(selectedProduct){
        const quantity = fb.get('quantity')?.value ?? 1;
        fb.patchValue({
          stock: selectedProduct.stock,
          price: selectedProduct.price * quantity
        })
      }
    })

    fb.get("quantity")?.valueChanges.subscribe(quantity => {
      const selectedProduct = this.$products.find(product => product.id === fb.get('productName')?.value);
      if(selectedProduct){
        const quantity1 = fb.get('quantity')?.value ?? 1;
        fb.patchValue({
          price: selectedProduct.price * quantity1
        })
      }
    })

    const detailId = Date.now().toString();
    this.productDetails.push({
      id: detailId,
      formGroup: fb
    });

    this.details.push(fb);
  }

  dropDetail(index: number) {
    this.details.removeAt(index);
    this.productDetails.splice(index, 1);
    this.newOrderForm.updateValueAndValidity();
  }

  detailText(fb:FormGroup):string {
    const productId = fb.get('productName')?.value;
    const productName = this.$products.find(product => product.id === productId)?.name;
    const quantity = fb.get('quantity')?.value;
    const price = fb.get('price')?.value;
    const stock = fb.get('stock')?.value;

    return `${productName} - Cantidad: ${quantity} - Precio: ${price} - Stock: ${stock}`;
  }

  get total():number{
    let total = 0;
    for (const detail of this.productDetails) {
      const partialPrice = detail.formGroup.get('price')?.value;
      total += partialPrice;
    }
    return total;
  }

  saveOrder() {
    console.log("hola")
    Object.values(this.newOrderForm.controls).forEach(control => {
      control.markAsTouched();
    });
    if (this.newOrderForm.valid) {
      const selectedProducts = this.productDetails.map(detail =>{
        const productId = detail.formGroup.get('id')?.value;
        const quantity = detail.formGroup.get('quantity')?.value;
        const price = detail.formGroup.get('price')?.value;
        const stock = detail.formGroup.get('stock')?.value;
        return{
          productId: productId,
          quantity: quantity,
          stock:stock,
          price: price,
        }
      })
      const customerName = this.newOrderForm.get('name')?.value;
      const email = this.newOrderForm.get('email')?.value;
      const timestamp = Date.now().toString();
      const orderCode = `${customerName?.substring(0,1)}${email?.substring(email.length-4)}${timestamp}`;
      const subtotal = this.total;
      const finalTotal = subtotal > 1000 ? subtotal*0.9 : subtotal;
      const id = Math.random().toString(36).substring(2, 7).toUpperCase();

      const order:Order = {
        customerName: customerName ?? "exampleName",
        email: email ?? "exampleEmail",
        orderCode: orderCode,
        products: selectedProducts,
        timestamp: timestamp,
        total: finalTotal,
        id:id
      }

      this.order_service.postOrder(order).subscribe({
        next: (response) =>{
          alert("Orden guardada exitosamente"+ response)
          this.newOrderForm.reset();
          this.productDetails =[];
          this.router.navigate(['/orders']);
        },error: (error) =>{
          console.error('Error al crear la orden:', error);
        }
      })
    }else {
      alert("Formulario no valido, revise los campos")
    }
  }
}
