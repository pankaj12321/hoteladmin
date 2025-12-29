import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pcprofile',
  templateUrl: './pcprofile.html',
  styleUrls: ['./pcprofile.scss']
})
export class Pcprofile implements OnInit {
  showModal = false;
  showEditModal = false;
  tranType: 'given' | 'taken' = 'given';

  form: any = {
    Rs: '',
    paymentMode: 'cash',
    description: '',
    returnDate: '',
    billno: ''
  };

  editForm: any = {};
  selectedFile: File | null = null;

  customerId!: string;
  customerData: any;

  transactionsGiven: any[] = [];
  transactionsTaken: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.customerId = params['personalCustomerRecordTranId'];
      if (this.customerId) {
        this.getProfile();
      }
    });
  }

  getProfile(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any>(
      `http://localhost:5000/api/admin/get/personal/customer/users?personalCustomerRecordTranId=${this.customerId}`,
      { headers }
    ).subscribe({
      next: (res) => {
        this.customerData = res.data[0];
        this.getTransactions();
      },
      error: (err) => console.error('Profile API error', err)
    });
  }

  getTransactions(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any>(
      `http://localhost:5000/api/admin/get/personal/customer/transection?personalCustomerRecordTranId=${this.customerData.personalCustomerRecordTranId}`,
      { headers }
    ).subscribe({
      next: (res) => {
        this.transactionsGiven = [];
        this.transactionsTaken = [];

        if (res.data && res.data.length > 0) {
          const record = res.data[0];

          if (record.givenToAdmin && record.givenToAdmin.length > 0) {
            this.transactionsGiven = record.givenToAdmin;
          }

          if (record.takenFromAdmin && record.takenFromAdmin.length > 0) {
            this.transactionsTaken = record.takenFromAdmin;
          }
        }
      },
      error: (err) => console.error('Transaction fetch error', err)
    });
  }
  // BILL MODAL
  showBillModal = false;
  billUrl: string = '';

  openBill(url: string) {
    this.billUrl = url;
    this.showBillModal = true;
  }

  closeBillModal() {
    this.billUrl = '';
    this.showBillModal = false;
  }

  openModal(type: 'given' | 'taken'): void {
    this.tranType = type;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form = { Rs: '', paymentMode: 'cash', description: '', returnDate: '', billno: '' };
    this.selectedFile = null;
  }

  openEditModal(transaction: any, type: 'given' | 'taken'): void {
    this.showEditModal = true;
    this.editForm = { ...transaction };
    this.tranType = type;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editForm = {};
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  submitTransaction(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const formData = new FormData();
    formData.append('personalCustomerRecordTranId', this.customerData.personalCustomerRecordTranId);

    const tranObj = { ...this.form };

    if (this.tranType === 'given') {
      formData.append('givenToAdmin', JSON.stringify(tranObj));
    } else {
      formData.append('takenFromAdmin', JSON.stringify(tranObj));
    }

    if (this.selectedFile) formData.append('paymentScreenshoot', this.selectedFile);

    this.http.post(
      'http://localhost:5000/api/admin/add/personal/customer/transection',
      formData,
      { headers }
    ).subscribe({
      next: () => {
        alert('Transaction Added Successfully');
        this.closeModal();
        this.getTransactions();
      },
      error: (err) => {
        console.error(err);
        alert('Transaction Failed');
      }
    });
  }

  updateTransaction(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const payload: any = {
      personalCustomerRecordTranId: this.customerData.personalCustomerRecordTranId,
      _id: this.editForm._id,
      Rs: this.editForm.Rs,
      paymentMode: this.editForm.paymentMode,
      description: this.editForm.description,
      returnDate: this.editForm.returnDate,
      billno: this.editForm.billno
    };

    this.http.patch(
      'http://localhost:5000/api/admin/update/personal/customer/transection/entry',
      payload,
      { headers }
    ).subscribe({
      next: () => {
        alert('Transaction Updated');
        this.closeEditModal();
        this.getTransactions();
      },
      error: (err) => {
        console.error(err);
        alert('Update Failed');
      }
    });
  }
}
