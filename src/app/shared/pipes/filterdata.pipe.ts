import { Pipe, PipeTransform } from "@angular/core";

//recherche par nom
@Pipe({
  name: 'filterdata'
})
export class FilterdataPipe implements PipeTransform {
 
  transform(items: any[], value: string, label:string): any[] {
    if (!items) return [];
    if (!value) return  items;
    if (value == '' || value == null) return [];
    return items.filter(e => e[label].toLowerCase().indexOf(value) > -1 || e.description.toLowerCase().indexOf(value) > -1 || e.category.toLowerCase().indexOf(value) > -1 );
    
  }
 
}



//recherche par nom
@Pipe({
  name: 'filterAmountMax'
})
export class FilterAmountMaxPipe implements PipeTransform {
 
  transform(items: any[], value: string, label:string): any[] {
    if (!items) return [];
    if (!value) return  items;
    if (value == '' || value == null) return [];
    return items.filter(e => e[label] >= 1 &&  e[label] <= value );
    
  }
 
}


//recherche par nom
@Pipe({
  name: 'filterAmountMin'
})
export class FilterAmountMinPipe implements PipeTransform {
 
  transform(items: any[], value: string, label:string): any[] {
    if (!items) return [];
    if (!value) return  items;
    if (value == '' || value == null) return [];
    return items.filter(e => e[label] >= 1 &&  e[label] >= value );
    
  }
 
}
