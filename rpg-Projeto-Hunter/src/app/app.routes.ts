import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'hero-select',
    loadComponent: () => import('./components/hero-select/hero-select.component').then(m => m.HeroSelectComponent)
  },
  {
    path: 'map',
    loadComponent: () => import('./components/map/map.component').then(m => m.MapComponent)
  },
  {
    path: 'idiomas',
    loadComponent: () => import('./components/idiomas/idiomas.component').then(m => m.IdiomasComponent)
  },
  {
    path: 'programacao',
    loadComponent: () => import('./components/programacao/programacao.component').then(m => m.ProgramacaoComponent)
  },
  {
    path: 'new-orleans',
    loadComponent: () => import('./components/new-orleans/new-orleans.component').then(m => m.NewOrleansComponent)
  },
  {
    path: 'tokyo',
    loadComponent: () => import('./components/tokyo/tokyo.component').then(m => m.TokyoComponent)
  },
  {
    path: 'game',
    loadComponent: () => import('./components/game-3d/game-3d.component').then(m => m.Game3dComponent)
  },
  {
    path: 'game-over',
    loadComponent: () => import('./components/game-over/game-over.component').then(m => m.GameOverComponent)
  },
  {
    path: 'modulos',
    loadChildren: () => import('./remote-entry/remote-entry.module').then(m => m.RemoteEntryModule),
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
