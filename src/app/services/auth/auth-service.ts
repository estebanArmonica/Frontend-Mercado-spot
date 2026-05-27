import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest } from '../../models/login.model';
import { environmentDev } from '../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environmentDev.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient){}

  /**
   * Este método http nos permite loguear a un usuario el cual al ingresar sus credenciales correctamente
   * nos retorna un token 
   * @param credentials: credenciales que el usuario debera ingresar para loguearse
   * @returns: Retorna un estado de 200 más el token del usuario
  */
  login(credentials: LoginRequest): Observable<LoginResponse>{
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if(response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            localStorage.setItem(this.userKey, JSON.stringify(response));
          }
        })
      );
  }

  /**
   * Este Método http nos permite regustrar a un nuevo usuario retornando un objecto json
   * @param user: credenciales registradas nuevas
   * @returns: retornara un estado de 202 creando un usuario nuevo o 400 en caso de problemas
  */
  register(user: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, user);
  }

  /**
   * Cuando se realiza el cierre de sesión se eliminan tanto las cookies del usuario como también
   * el token del usuario para seguridad
   * @param tokenKey: eliminar del storage el token del usuario
   * @param userKey: elimina la cookie del usuario
  */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Este método trata de obtener el token del usuario
   * @returns: retorno el token obtenido del usuario del tokenKey
  */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * este método retorna el usuario el cual se ha logueado
   * @returns: retorna el usuario buscando a travez de JSON
  */
  getUser(): LoginResponse | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  /**
   * verifica si el usuario está autenticado 
   * @returns: retorna la autenticación del usuario por el token
  */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * verifica si el rol existe en la base de datos (admin, user, etc) 
   * @param role: el rol que trae el usuario desde el token
   * @returns: retorna un autenticación por el rol del usuario
  */
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.roles?.includes(role) || false;
  }

  // refresca el token
  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, {});
  }
}
