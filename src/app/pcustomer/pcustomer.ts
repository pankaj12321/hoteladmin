import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pcustomer',
  templateUrl: './pcustomer.html',
  styleUrls: ['./pcustomer.scss']
})
export class Pcustomer implements OnInit {

  customers: any[] = [];
  filteredCustomers: any[] = [];

  searchTerm: string = '';
  showModal: boolean = false;

  customer = {
    name: '',
    mobile: '',
    city: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getCustomers();
  }
  getCustomers(): void {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`
    };

    this.http.get<any>(
      'http://localhost:5000/api/admin/get/personal/customer/users',
      { headers }
    ).subscribe({
      next: (res) => {
        this.customers = res.data || [];
        this.filteredCustomers = this.customers;
      },
      error: (err) => {
        console.error('Get customers error:', err);
      }
    });
  }

  searchCustomer(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredCustomers = this.customers.filter(c =>
      (c.name || '').toLowerCase().includes(term) ||
      (c.mobile || '').includes(term) ||
      (c.city || '').toLowerCase().includes(term)
    );
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.customer = {
      name: '',
      mobile: '',
      city: ''
    };
  }

  addCustomer(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Token missing, please login again');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const payload = {
      name: this.customer.name,
      mobile: this.customer.mobile,
      city: this.customer.city
    };

    this.http.post(
      'http://localhost:5000/api/admin/add/personal/customer',
      payload,
      { headers }
    ).subscribe({
      next: () => {
        this.closeModal();
        this.getCustomers();
      },
      error: (err) => {
        console.error('Add customer error:', err);
        alert(err.error?.message || 'Add failed');
      }
    });
  }
openProfile(id: string): void {
  this.router.navigate(['/home/pcprofile'], {
    queryParams: {
      personalCustomerRecordTranId: id
    }
  });
}


}
