import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-remote-wrapper',
  standalone: false,
  template: '<div #reactRoot></div>',
  styles: ['']
})
export class RemoteWrapperComponent implements OnDestroy {
  @ViewChild('reactRoot', { static: true }) reactRoot!: ElementRef;

  constructor(private route: ActivatedRoute) {
    
    this.route.url.subscribe(segments => {
      const modulePath = segments[segments.length - 1].path;
      this.loadAndMountReactModule(modulePath);
    });
  }

  async loadAndMountReactModule(path: string) {
    if (!path) return;

    
    let exposedModule: string;
    let componentName: string;
    let props: any = {}; 

    if (path === 'quiz-batalha') {
      exposedModule = './QuizModule';
      componentName = 'QuizComponent';
      props = { questionId: 123, hunterId: 'Kaelen' }; 
    } else if (path === 'lingua-sinais') {
      exposedModule = './SignLanguageModule';
      componentName = 'SignLanguageComponent'; 
      props = { language: 'ASL', level: 'Fácil' };
    } else {
      return;
    }

    try {
     
      const [reactModule, bridgeModule] = await Promise.all([
        loadRemoteModule({
          remoteEntry: 'http://localhost:5173/remoteEntry.js',
          remoteName: 'reactRemote',
          exposedModule: exposedModule,
        }),
        loadRemoteModule({
          remoteEntry: 'http://localhost:5173/remoteEntry.js',
          remoteName: 'reactRemote',
          exposedModule: './ModuleBridge',
        }),
      ]);

     
      const Component = reactModule[componentName];
      const { mount } = bridgeModule; 

      mount(this.reactRoot.nativeElement, Component, props);

    } catch (error) {
      console.error('Falha ao carregar ou montar o módulo React:', error);
    }
  }

  
  ngOnDestroy(): void {
    loadRemoteModule({
        remoteEntry: 'http://localhost:5173/remoteEntry.js',
        remoteName: 'reactRemote',
        exposedModule: './ModuleBridge',
    }).then(m => {
        const { unmount } = m;
        unmount(this.reactRoot.nativeElement);
    });
  }
}