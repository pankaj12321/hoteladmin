import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls: ['./driver-list.component.scss']
})
export class DriverListComponent implements OnInit {
  drivers: any[] = [];
  filteredDrivers: any[] = [];
  searchTerm: string = '';
  successPopup = false;
  successMessage = "";

  showModal = false;
  editModal = false;

  newDriver: any = {
    name: '',
    carNumber: '',
    mobile: '',
    email: '',
    srNumber: '',
      location: ''
  };

  editDriver: any = {};
  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    const token = this.getToken();
    if (!token) {
      this.logout();
    } else {
      this.getDrivers();
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) this.logout();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getDrivers() {
    this.http.get<any>('Http://localhost:5000/api/admin/get-drivers',
      { headers: this.getHeaders() })
      .subscribe({
        next: (res: any) => {
          this.drivers = res.drivers || [];
          this.filteredDrivers = this.drivers;
        },
        error: (err) => {
          if (err.status === 401) this.logout();
        }
      });
  }

  applySearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredDrivers = this.drivers.filter(d =>
      d.name.toLowerCase().includes(term) ||
      d.carNumber.toLowerCase().includes(term) ||
      d.mobile.toLowerCase().includes(term) ||
      d.srNumber.toLowerCase().includes(term)
    );
  }


  openModal() {
    this.showModal = true;
    if (this.drivers.length > 0) {
      const maxSr = Math.max(
        ...this.drivers.map(d => parseInt(d.srNumber.replace("SR", "")) || 0)
      );
      this.newDriver.srNumber = "SR" + (maxSr + 1).toString().padStart(3, '0');
    } else {
      this.newDriver.srNumber = "SR001";
    }
  }

  closeModal() {
    this.showModal = false;
    this.newDriver = { name: '', carNumber: '', mobile: '', email: '', srNumber: '', location: '' };
  }

  addDriver() {
    this.newDriver.carNumber = this.newDriver.carNumber.toUpperCase();
    if (!/^\d{10}$/.test(this.newDriver.mobile)) {
      return;
    }

    this.http.post('Http://localhost:5000/api/admin/add-driver',
      this.newDriver, { headers: this.getHeaders() })
      .subscribe({
        next: (res: any) => {
          this.closeModal();
          this.getDrivers();
            this.showSuccess("Driver added successfully!");
        },
        error: (err) => {
          if (err.status === 401) this.logout();
        }
      });
  }

  openEditModal(driver: any) {
    this.editDriver = { ...driver };
    this.editModal = true;
  }

  closeEditModal() {
    this.editModal = false;
    this.editDriver = {};
  }

  updateDriver() {
    const driverId = this.editDriver.driverId;

    // Car Number uppercase
    this.editDriver.carNumber = this.editDriver.carNumber.toUpperCase();

    // Mobile number validation
    if (!/^\d{10}$/.test(this.editDriver.mobile)) {
      return;
    }

    const payload = {
      driverId: driverId,
      name: this.editDriver.name,
      mobile: this.editDriver.mobile,
      carNumber: this.editDriver.carNumber,
      srNumber: this.editDriver.srNumber,
      location: this.editDriver.location
    };

    this.http.patch(
      `Http://localhost:5000/api/admin/edit-driver-profile`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res: any) => {
        this.closeEditModal();
        this.getDrivers();
              this.showSuccess("Driver updated successfully!");

      },
      error: (err) => {
        console.log('Error:', err);
        if (err.status === 401) this.logout();
        else alert('Update failed!');
      }
    });
  }
  viewDriverProfile(driverId: string) {
    this.router.navigate(['/home/list', driverId]);
  }
  showSuccess(message: string) {
  this.successMessage = message;
  this.successPopup = true;

  setTimeout(() => {
    this.successPopup = false;
  }, 1500); // 2 seconds
}

}
