import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.scss']
})
export class GameOverComponent implements OnInit {
  score = 0;
  phase = 1;
  isVictory = false;
  
  constructor(private route: ActivatedRoute, private router: Router) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.score = params['score'] || 0;
      this.phase = params['phase'] || 1;
      this.isVictory = params['victory'] || false;
    });
  }
  
  playAgain(): void {
    this.router.navigate(['/game']);
  }
  
  returnToMenu(): void {
    this.router.navigate(['/']);
  }
}
