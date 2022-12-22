export class FileItem {
    
  $key: string;
  public file:File;
  public url:string = '';
  public isUploading:boolean = false;
  public progress:number = 0;
  createdAt: Date = new Date();
  name:string;

  public constructor(file:File) {
    this.file = file;
  }

}
