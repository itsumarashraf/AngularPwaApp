import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { SwUpdate } from '@angular/service-worker';
import { TodoService } from './todo.service';
import { liveQuery } from 'dexie';
import { db, todo } from '../../db/db'

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
todoList:any[]=[];
todoForm: FormGroup;
isOnline:boolean = true;
dataInCache:boolean = false;
cachedata:any[]=[]
obj=Object;

  constructor(private todoservice: TodoService,
    private update: SwUpdate
    ) { }

  ngOnInit(): void {
    this.getTodoList();
    this.createForm();
    this.updateTodoClient();
    this.checkNetworkStatus();
    // if(navigator.onLine){
    //   this.isOnline = true;
    //   // caches.open('mycache').then(cache => {
    //   //   cache.add('/')
    //   // })
    // }
  }

  createForm(){
    this.todoForm = new FormGroup({
      'task': new FormControl(null),
      'detail': new FormControl(null)
    });
    
  }

  getTodoList(){
    this.todoservice.getTodos().subscribe(res => {
      this.todoList=res;
      console.log(this.todoList)
    });
  }


  saveTodo(){
    console.log(this.todoForm.value)
    let dataobj = [
      {task: this.todoForm.value.task, detail: this.todoForm.value.detail}
    ]
    this.todoservice.saveTodo(this.todoForm.value).subscribe({
        next: (res) => {
        console.log(res)
        this.todoForm.reset();
        this.getTodoList();
        },
        error: (err) => {
          //cache data in idb
          console.log('cache hit', err);
          db.todo.add(this.todoForm.value)
          this.todoForm.reset();
    
        }
    })
    
  }

  updateTodoClient(){
    console.log('update client function')
    if(!this.update.isEnabled){
      console.log('server worker is not supported by your browser')
    }
    this.update.versionUpdates.subscribe((event) => {

      switch (event.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${event.version.hash}`);

          if(confirm('New update is availabe! click to update to latest version')){
            this.update.activateUpdate().then(() => location.reload());
          }

          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${event.currentVersion.hash}`);
          console.log(`New app version ready for use: ${event.latestVersion.hash}`);
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(`Failed to install app version '${event.version.hash}': ${event.error}`);
          break;
      }
    })
  }

  syncData(){
    db.todo.each(x => {
      this.cachedata.push({task: x.task, detail: x.detail})
      console.log(JSON.stringify(this.cachedata))
      this.todoservice.saveTodo({task: x.task, detail: x.detail}).subscribe((res) => {
        console.log(res)
        console.log('sync success')
        this.getTodoList();
      })
    })

    // this.todoservice.saveTodo(this.cachedata).subscribe((res) => {
    //   console.log(res)
    //   console.log('sync success')
    // })

    db.resetDatabase();

  }

  // backgroundSync(){
  //   navigator.serviceWorker.ready.then((swRegistration) => swRegistration.sync.register('post-data'))
  // }

  checkNetworkStatus() {
    addEventListener('offline', x =>{
      this.isOnline = false;
    });
    addEventListener('online', x =>{
      this.isOnline = true;

      db.todo.count().then(res =>{
        if(res >=1){
          this.dataInCache=true;
          db.todo.each(x => console.log(x))
        }
      })
    })
  }
}
