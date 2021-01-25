import { Injectable } from '@angular/core';
import { Promotion } from '../shared/promotion';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {

  constructor(private http: HttpClient) { }

  getPromotions(): Observable<Promotion[]> {
    //return Promise.resolve(PROMOTIONS);
    /*return new Promise(resolve => {
      //Simulate server latency with 2 seconds delay
      setTimeout(() => resolve(PROMOTIONS), 2000);
    });*/

    return this.http.get<Promotion[]>(baseURL + 'promotions');
  }

  getPromotion(id: String): Observable<Promotion> {
    //return Promise.resolve(PROMOTIONS.filter( (promo) => (promo.id === id) )[0]);
    /*return new Promise(resolve => {
      //Simulate server latency with 2 seconds delay
      setTimeout(() => resolve(PROMOTIONS.filter( (promo) => (promo.id === id) )[0]), 2000);
    });*/

    return this.http.get<Promotion>(baseURL + 'promotions/' + id);
  }

  getFeaturedPromotion(): Observable<Promotion> {
    //return Promise.resolve(PROMOTIONS.filter( (promo) => (promo.featured) )[0]);
    /*return new Promise(resolve => {
      //Simulate server latency with 2 seconds delay
      setTimeout(() => resolve(PROMOTIONS.filter( (promo) => (promo.featured) )[0]), 2000);
    });*/

    return this.http.get<Promotion>(baseURL + 'promotions?featured=true')
      .pipe(map(promo => promo[0]));
  }

  getPromotionIds(): Observable<string[] | any> {
		return this.getPromotions()
			.pipe(map(promo => promo.map(promo => promo.id)));
	}
}
