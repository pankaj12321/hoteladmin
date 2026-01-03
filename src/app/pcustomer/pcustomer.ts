import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pcustomer',
  templateUrl: './pcustomer.html',
  styleUrls: ['./pcustomer.scss']
})
export class Pcustomer implements OnInit {

  showModal = false; // modal control
  isEditMode = false; // flag for edit mode

  customer: any = {
    name: '',
    mobile: '',
    city: '',
    personalCustomerRecordTranId: '' // required for update
  };

  customers: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.getAllCustomers();
  }

  // 🔵 OPEN MODAL
  openModal() {
    this.showModal = true;
  }

  // 🔵 CLOSE MODAL
  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.customer = { name: '', mobile: '', city: '', personalCustomerRecordTranId: '' };
  }

  // ✅ ADD CUSTOMER
  addCustomer() {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post(
      'http://localhost:5000/api/admin/add/personal/customer',
      this.customer,
      { headers }
    ).subscribe({
      next: () => {
        alert('Customer Added Successfully');
        this.closeModal();
        this.getAllCustomers();
      },
      error: err => console.error(err)
    });
  }

  // ✅ GET ALL CUSTOMERS
  getAllCustomers() {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get(
      'http://localhost:5000/api/admin/get/personal/customer/users',
      { headers }
    ).subscribe((res: any) => {
      this.customers = res?.data || res;
    });
  }

  // 🔹 OPEN PROFILE
  openProfile(customer: any) {
    const id = customer.personalCustomerRecordTranId;
    this.router.navigate(['/home/pcprofile', id]);
  }

  // 🔹 EDIT CUSTOMER
  editCustomer(customer: any) {
    this.isEditMode = true;
    this.showModal = true;
    this.customer = { ...customer }; // copy data to modal
  }

  // 🔹 UPDATE CUSTOMER (PATCH)
  updateCustomer() {
    if (!this.customer.personalCustomerRecordTranId) {
      alert('Customer ID missing!');
      return;
    }

    const payload = {
      personalCustomerRecordTranId: this.customer.personalCustomerRecordTranId,
      name: this.customer.name,
      mobile: this.customer.mobile,
      city: this.customer.city
    };

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.patch(
      'http://localhost:5000/api/admin/update/personal/customer/profile',
      payload,
      { headers }
    ).subscribe({
      next: () => {
        alert('Customer Updated Successfully');
        this.closeModal();
        this.getAllCustomers();
      },
      error: err => console.error(err)
    });
  }
}
