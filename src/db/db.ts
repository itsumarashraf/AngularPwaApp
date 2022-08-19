import Dexie, { Table } from 'dexie';

export interface todo {
  id?: number;
  task: string;
  detail: string
}


export class AppDB extends Dexie {
  todo!: Table<todo>;

  constructor() {
    super('todoDB');
    this.version(3).stores({
      todo: '++id, name, detail',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    // const todoListId = await db.todoLists.add({
    //   title: 'To Do Today',
    // });
    // await db.todo.bulkAdd([
    //   {
    //     task: 'eat',
    //     detail: 'Feed the birds',
    //   },
    //   {
    //     task: 'walk',
    //     detail: 'walk at 4',
    //   },
    //   {
    //     task: 'sleep',
    //     detail: 'go to sleep',
    //   },
    // ]);
  }

  async resetDatabase() {
    await db.transaction('rw', 'todo', () => {
      this.todo.clear();
      this.populate();
    });
  }
}

export const db = new AppDB();
