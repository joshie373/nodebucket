import {Routes} from '@angular/router';
import {BaseLayoutComponent} from './shared/base-layout/base-layout.component';
import {HomeComponent} from './pages/home/home.component';
import {AuthLayoutComponent} from './shared/auth-layout/auth-layout.component';
import { LoginGuard } from './shared/guards/login.guard';
import { NodebucketComponent } from './pages/nodebucket/nodebucket.component';

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
      },
      {
        path: 'nodebucket',
        component: NodebucketComponent,
        canActivate:[LoginGuard]
      },
      /*
        New components go here...
       */
    ]
  }
];
