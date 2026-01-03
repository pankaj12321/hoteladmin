import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-pcprofile',
  templateUrl: './pcprofile.html',
  styleUrls: ['./pcprofile.scss']
})
export class Pcprofile implements OnInit {


  customer: any;
  customerId: string | null = null;

  entry = {
    billAmount: '',
    amountPaidAfterDiscount: '',
    paymentMode: 'cash',
    description: '',
    status: 'Pending'
  };

  paymentScreenshot: File | null = null;
  entries: any[] = [];
  api = 'http://localhost:5000/api/admin';
  loadingEntries = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.customerId = this.route.snapshot.paramMap.get('id');
    this.getCustomerProfile();
    this.getCustomerEntries();
  }

  // 🔵 GET CUSTOMER PROFILE
  getCustomerProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.get<any>(
      `${this.api}/get/personal/customer/users?personalCustomerRecordTranId=${this.customerId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe(res => {
      this.customer = res.data[0];
    });
  }

  // 🔵 GET CUSTOMER ENTRIES
  getCustomerEntries() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.loadingEntries = true;
    this.http.get<any>(
      `${this.api}/get/personal/customer/entry?personalCustomerRecordTranId=${this.customerId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: res => {
        this.entries = res.data || [];
        this.loadingEntries = false;
      },
      error: err => {
        console.error(err);
        this.loadingEntries = false;
      }
    });
  }

  // 🔵 FILE SELECT
  onFileSelect(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.paymentScreenshot = event.target.files[0];
      console.log('Selected File:', this.paymentScreenshot);
    } else {
      this.paymentScreenshot = null;
    }
  }

  // 🔵 ADD ENTRY (FormData POST)
  addEntry() {
    const token = localStorage.getItem('token');
    if (!token) return alert('Token missing');
    if (!this.customerId) return alert('Customer ID missing');

    // Validate required fields
    if (!this.entry.billAmount || this.entry.billAmount === '') {
      return alert('Bill Amount is required');
    }
    if (!this.entry.amountPaidAfterDiscount || this.entry.amountPaidAfterDiscount === '') {
      return alert('Amount Paid After Discount is required');
    }
    if (!this.entry.paymentMode) {
      return alert('Payment Mode is required');
    }

    const formData = new FormData();

    // REQUIRED FIELDS
    formData.append('personalCustomerRecordTranId', String(this.customerId));
    formData.append('billAmount', String(this.entry.billAmount));
    formData.append('amountPaidAfterDiscount', String(this.entry.amountPaidAfterDiscount));
    formData.append('paymentMode', String(this.entry.paymentMode));
    formData.append('description', String(this.entry.description || ''));
    formData.append('status', String(this.entry.status));

    // FILE - only append if file is selected (matching pattern from expense/earning APIs)
    if (this.paymentScreenshot) {
      formData.append('paymentScreenshoot', this.paymentScreenshot);
    }

    // Debug: Log FormData contents
    console.log('📤 Submitting Personal Customer Entry:');
    console.log('personalCustomerRecordTranId:', this.customerId);
    console.log('billAmount:', this.entry.billAmount);
    console.log('amountPaidAfterDiscount:', this.entry.amountPaidAfterDiscount);
    console.log('paymentMode:', this.entry.paymentMode);
    console.log('description:', this.entry.description);
    console.log('status:', this.entry.status);
    console.log('paymentScreenshot file:', this.paymentScreenshot ? this.paymentScreenshot.name : 'No file selected');

    // Log all FormData entries
    console.log('\n🔍 FormData entries:');
    for (let pair of (formData as any).entries()) {
      console.log(pair[0], ':', pair[1]);
    }

    this.http.post(
      `${this.api}/add/personal/customer/entry`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        alert('Entry Added Successfully');

        this.entry = {
          billAmount: '',
          amountPaidAfterDiscount: '',
          paymentMode: 'cash',
          description: '',
          status: 'Pending'
        };

        this.paymentScreenshot = null;
        this.getCustomerEntries();
      },
      error: err => {
        console.error(err);
        alert(err.error?.message || 'Error adding entry');
      }
    });
  }


}
