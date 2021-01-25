import { Injectable } from '@angular/core';
import { Leader } from '../shared/leader';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class LeaderService {

	constructor(private http: HttpClient) { }

	getLeaders(): Observable<Leader[]> {
		//return Promise.resolve(LEADERS);
		/*return new Promise(resolve => {
			//Simulate server latency with 2 seconds delay
			setTimeout(() => resolve(LEADERS), 2000);
		});*/
		return this.http.get<Leader[]>(baseURL + 'leaders');
	}

	getLeader(id: String): Observable<Leader> {
		//return Promise.resolve(LEADERS.filter( (leader) => (leader.id === id) )[0]);
		/*return new Promise(resolve => {
			//Simulate server latency with 2 seconds delay
			setTimeout(() => resolve(LEADERS.filter( (leader) => (leader.id === id) )[0]), 2000);
		});*/

		//return of(LEADERS.filter( (leader) => (leader.id === id) )[0]).pipe(delay(2000)).toPromise();
		return this.http.get<Leader>(baseURL + 'leaders/' + id);
	}

	getFeaturedLeader(): Observable<Leader> {
		//return Promise.resolve(LEADERS.filter( (leader) => (leader.featured) )[0]);
		/*return new Promise(resolve => {
			//Simulate server latency with 2 seconds delay
			setTimeout(() => resolve(LEADERS.filter( (leader) => (leader.featured) )[0]), 2000);
		});*/

		return this.http.get<Leader>(baseURL + 'leaders?featured=true')
			.pipe(map(dishes => dishes[0]));
	}

	getLeaderIds(): Observable<string[] | any> {
		return this.getLeaders()
			.pipe(map(leader => leader.map(leader => leader.id)));
	}
}
