import { ValidatorFn, AbstractControl } from '@angular/forms';
//Validates emp id to ensure emp doesnt already exist
  export function empExistsValidator(empArr: any): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const exists = empArr.includes(control.value);
      return exists ? {'empExists': {value: control.value}} : null;
    };
  }