import {AbstractControl, FormArray, FormGroup, ValidationErrors} from "@angular/forms";

export function moreThanStock(control:AbstractControl): ValidationErrors | null {
  const formGroup = control.parent
  if (!formGroup) {
    return null;
  }
  const quantity = control.value;
  const stock = formGroup.get("stock")?.value;
  if (quantity && stock && quantity > stock){
    return {moreThanStock:{actual:stock,quantity:quantity}}
  }
  return null;
}

export function atLeastOneProduct(control:AbstractControl): ValidationErrors | null {
  const products = control as FormArray;
  if (!products || products.length === 0){
    return {noProductFound:true};
  }
  return null;
}

export function lessThan10Products(control:AbstractControl): ValidationErrors | null {
  const products = control as FormArray;
  let x = 0;
  for (const control1 of products.controls) {
    x += control1?.get("quantity")?.value;
  }
  return 10 < x ? {maxTotalQuantity:true} : null;
}

export function duplicates(control:AbstractControl): ValidationErrors | null {
  const formArray = control as FormArray;

  const seenProducts = new Set<number>();
  for (const formGroup of formArray.controls) {
    const product = formGroup.get("productName")?.value;
    if (product && seenProducts.has(product)) {
      return { duplicated: true };
    }
    if (product) {
      seenProducts.add(product);
    }
  }
  return null;
}
