import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Gif, SearchResponse } from '../interfaces/gifs.interfaces';

// al ser root estará disponible de toda la aplicacion
@Injectable({
  providedIn: 'root',
})
export class GifsService {
  public gifList: Gif[] = [];
  // para guardar lo que se esté buscando
  private _tagsHistory: string[] = [];
  private apiKey: string = 'Psx8BfakIKio3DWYbDhEdWKa6Zy68cc1';
  private serviceUrl: string = 'https:api.giphy.com/v1/gifs';

  constructor(private http: HttpClient) {
    this.loadLocalStorage();
  }

  get tagsHistory() {
    // esto es usar spreed que es una copia del arreglo
    // con eso se evita perder la referencia de javascript

    return [...this._tagsHistory];
  }

  private organizeHistory(tag: string) {
    tag = tag.toLowerCase();
    if (this._tagsHistory.includes(tag)) {
      // armar un arreglo nuevo que se asigna al tagHistory con todos lo elementos menos el que existe
      this._tagsHistory = this._tagsHistory.filter((olTag) => olTag !== tag);
    }
    this._tagsHistory.unshift(tag);
    this._tagsHistory = this.tagsHistory.splice(0, 10);
    this.saveLocalStorage();
  }

  private saveLocalStorage(): void {
    localStorage.setItem('history', JSON.stringify(this._tagsHistory));
  }

  private loadLocalStorage(): void {
    if (!localStorage.getItem('history')) return;
    this._tagsHistory = JSON.parse(localStorage.getItem('history')!);

    if (this._tagsHistory.length === 0) return;
    this.searchTag(this._tagsHistory[0]);
  }

  // cada metodo debe tener una funcion, por eso no se debiese agregar toda la logica en el metodo searchTag
  public searchTag(tag: string): void {
    // ahi decimos si el tag está vacio, entonces no hara nada.
    if (tag.length === 0) return;
    this.organizeHistory(tag);

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('limit', 10)
      .set('q', tag);
    this.http
      .get<SearchResponse>(`${this.serviceUrl}/search`, { params })
      .subscribe((resp) => {
        this.gifList = resp.data;
        console.log('respuesta del observable: ', this.gifList);
      });
    console.log(this.tagsHistory);
  }
}
