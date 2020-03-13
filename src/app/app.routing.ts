import {Routes} from '@angular/router';
import {BaseLayoutComponent} from './shared/base-layout/base-layout.component';
import {HomeComponent} from './pages/home/home.component';
import {AuthLayoutComponent} from './shared/auth-layout/auth-layout.component';
import { LoginGuard } from './shared/guards/login.guard';

export const AppRoutes: Routes = [
  {
    path: '',
    component: BaseLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        canActivate:[LoginGuard]
      },
      {
        path: 'login',
        component: AuthLayoutComponent
      }
      /*
        New components go here...
       */
    ]
  }
];
