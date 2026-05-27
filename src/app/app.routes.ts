import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/auth/login'
import { DasboardComponent } from './components/dashboard/dasboard-component';
import { AuthGuard } from './guards/auth.guard-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', component: DasboardComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule{}
