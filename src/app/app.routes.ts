import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
    canMatch: [
      // () => {
      //   console.log('hola Mundo');
      //   return true;
      // },
      // NotAuthenticatedGuard,
    ],
  },

  {
    path: 'admin',
    loadChildren: () => import('./admin-dashboard/admin-dashboard.routes'),
  },

  {
    path: '',
    loadChildren: () => import('./store-front/store-front.routes'),
  },
];
