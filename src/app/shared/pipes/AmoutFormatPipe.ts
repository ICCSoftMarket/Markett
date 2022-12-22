import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'amountformat'
})
export class AmountFormatPipe implements PipeTransform {

    transform(value: number | string, locale?: string): string {
        if(value){
          if (typeof (value) === 'number') {
            // return new Intl.NumberFormat(locale ='cm-CM', { style: 'decimal', currency: 'XAF' }).format(Number(value));
            return Number(value).toLocaleString();
          }
          else { return Number(value.replace(/\s/g, '')).toLocaleString(); }
        }else{
          return '0';
        }
    }
}
