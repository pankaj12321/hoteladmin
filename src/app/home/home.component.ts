import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    hotelName: string = '';
    branchName: string = '';


  ngOnInit() {
    const user = localStorage.getItem('hotelUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.hotelName = parsedUser.hotelName; 
    }
      this.branchName = localStorage.getItem('branchName') || '';
  }
    showPasswordPopup: boolean = false;
  passwordInput: string = '';
  khatabookActive: boolean = false;

  constructor(private router: Router) {}

  openPasswordPopup() {
    this.showPasswordPopup = true;
    this.passwordInput = '';
  }

  closePopup() {
    this.showPasswordPopup = false;
  }

  checkPassword() {
    const correctPassword = '1234'; // aapka password

    if (this.passwordInput === correctPassword) {
      this.showPasswordPopup = false;
      this.khatabookActive = true;
      this.router.navigate(['/home/khatabook']);
    } else {
      alert('Incorrect password!');
    }
  }

}
