import { NgModule } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { RouterModule, Routes } from '@angular/router';
import { RemoteWrapperComponent } from './remote-wrapper/remote-wrapper.component'; 


const routes: Routes = [
  {
    path: '', 
    component: RemoteWrapperComponent,
    children: [
      {
        path: 'quiz-batalha', 
        loadChildren: () =>
          loadRemoteModule({
            remoteEntry: 'http://localhost:5173/remoteEntry.js', 
            remoteName: 'reactRemote', 
            exposedModule: './QuizModule',
          })
          .then(m => m.QuizModule), 
      },
      {
        path: 'lingua-sinais', 
        loadChildren: () =>
          loadRemoteModule({
            remoteEntry: 'http://localhost:5173/remoteEntry.js',
            remoteName: 'reactRemote',
            exposedModule: './SignLanguageModule', 
          })
          .then(m => m.SignLanguageModule),
      },
    ],
  },
];

@NgModule({
  declarations: [
    RemoteWrapperComponent 
  ],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RemoteEntryModule {}