import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  private headers = new HttpHeaders(
    {'Content-Type': 'application/json'}
  )
  constructor(public http: HttpClient) {}

  public getTodos(){
    return this.http.get<any>('https://todo-pwaapp-default-rtdb.firebaseio.com/todo.json')
  }
  
  public saveTodo(data:any){
    return this.http.post('https://todo-pwaapp-default-rtdb.firebaseio.com/todo.json',data, {headers : this.headers});
  }
}
