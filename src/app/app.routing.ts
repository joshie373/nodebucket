import {Routes} from '@angular/router';
import {BaseLayoutComponent} from './shared/base-layout/base-layout.component';
import {HomeComponent} from './pages/home/home.component';
import {AuthLayoutComponent} from './shared/auth-layout/auth-layout.component';
import { LoginGuard } from './shared/guards/login.guard';
import { NodebucketComponent } from './pages/nodebucket/nodebucket.component';
import { AdminComponent } from './pages/admin/admin.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { UsersComponent } from './pages/admin/users/users.component';
import { TasksComponent } from './pages/admin/tasks/tasks.component';
import { ReportsComponent } from './pages/admin/reports/reports.component';
import { AboutComponent } from './pages/about/about.component';

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
      {
        path: 'about',
        component: AboutComponent
      },
      {
        path: 'admin',
        component: AdminComponent,
        canActivate:[LoginGuard],
        children: [
          {
            path: 'users',
            component: UsersComponent,
            outlet: "adminRouter"
          },
          {
            path: 'tasks',
            component: TasksComponent,
            outlet: "adminRouter"
          },
          {
            path: 'reports',
            component: ReportsComponent,
            outlet: "adminRouter"
          }

        ]
      },
      {
        path: '**',
        pathMatch: 'full', 
        component: NotFoundComponent
      },
      
      /*
        New components go here...
       */
    ]
  }
];
