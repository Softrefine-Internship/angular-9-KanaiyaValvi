import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule } from '@angular/router';
import { BlogsComponent } from './blogs/blogs.component';
import { AuthComponent } from './auth/auth.component';
import { BlogComponent } from './blogs/blog/blog.component';
import { AuthGuard } from './auth/auth.guard';
import { NotfoundComponent } from './notfound/notfound.component';

const appRoutes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: BlogsComponent,
  },
  {
    path: 'blog',
    canActivate: [AuthGuard],
    component: BlogsComponent,
  },
  { path: 'blog/:id', canActivate: [AuthGuard], component: BlogComponent },

  { path: 'auth', component: AuthComponent },
  { path: '**', component: NotfoundComponent },
];

const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
};

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, routerOptions)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
