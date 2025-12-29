import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cprofile',
  templateUrl: './cprofile.html',
  styleUrls: ['./cprofile.scss']
})
export class Cprofile implements OnInit {
customer: any = null;

  allGivenList: any[] = [];
  allTakenList: any[] = [];
  finalTransactionList: any[] = [];

  totalGiven = 0;
  totalTaken = 0;
  finalBalance = 0;

  id: string = "";

  // popup fields
  showPopup = false;
  type: 'give' | 'get' | '' = '';
  amount: number = 0;
  description: string = '';
  billno: string = '';
  date: string = '';
  paymentMode: 'cash' | 'online' = 'cash'; // ✅ payment mode
  selectedImage: File | null = null;

  // branch
  branches: string[] = ['Gokulpura', 'Sikar', 'Sanwali'];
  selectedBranch: string = 'ALL';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.getCustomer();
    this.getTransactionRecord();
  }

  // ================= HEADERS =================
  getHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: {
        Authorization: 'Bearer ' + token
      }
    };
  }

  // ================= CUSTOMER =================
  getCustomer() {
    this.http.get(
      `http://localhost:5000/api/admin/get/transection-user?transectionUserId=${this.id}`,
      this.getHeaders()
    ).subscribe((res: any) => {
      this.customer = res.data?.[0] || null;
    });
  }

  // ================= TRANSACTIONS =================
  getTransactionRecord() {
    this.http.get(
      `http://localhost:5000/api/admin/get/transection-record?transectionUserId=${this.id}`,
      this.getHeaders()
    ).subscribe((res: any) => {

      const data = res.data?.[0];
      if (!data) return;

      this.allGivenList = data.givenToAdmin.map((x: any) => ({
        type: 'give',
        Rs: x.Rs,
        paymentMode: x.paymentMode,
        description: x.description,
        billno: x.billno,
        date: x.updatedAt,
        updatedAt: x.updatedAt,
        returnDate: x.returnDate || x.updatedAt,
        hotelBranchName: x.hotelBranchName,
        paymentScreenshot: x.paymentScreenshoot
      }));

      this.allTakenList = data.takenFromAdmin.map((x: any) => ({
        type: 'get',
        Rs: x.Rs,
        paymentMode: x.paymentMode,
        description: x.description,
        billno: x.billno,
        date: x.updatedAt,
        updatedAt: x.updatedAt,
        returnDate: x.returnDate || x.updatedAt,
        hotelBranchName: x.hotelBranchName,
        paymentScreenshot: x.paymentScreenshoot
      }));

      this.applyBranchFilter();
    });
  }

  // ================= BRANCH FILTER =================
  selectBranch(branch: string) {
    this.selectedBranch = branch;
    this.applyBranchFilter();
  }

  applyBranchFilter() {

    if (this.selectedBranch === 'ALL') {
      this.finalTransactionList = [
        ...this.allGivenList,
        ...this.allTakenList
      ];
    } else {
      this.finalTransactionList = [
        ...this.allGivenList.filter(x => x.hotelBranchName === this.selectedBranch),
        ...this.allTakenList.filter(x => x.hotelBranchName === this.selectedBranch)
      ];
    }

    // sort by date
    this.finalTransactionList.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    this.totalGiven = this.finalTransactionList
      .filter(x => x.type === 'give')
      .reduce((sum, x) => sum + Number(x.Rs), 0);

    this.totalTaken = this.finalTransactionList
      .filter(x => x.type === 'get')
      .reduce((sum, x) => sum + Number(x.Rs), 0);

    this.finalBalance = this.totalGiven - this.totalTaken;
  }

  // ================= POPUP =================
  openPopup(type: 'give' | 'get') {
    this.type = type;
    this.showPopup = true;
    this.amount = 0;
    this.description = '';
    this.billno = '';
    this.date = new Date().toISOString().split('T')[0]; // today
    this.selectedImage = null;
    this.selectedBranch = this.branches[0];
    this.paymentMode = 'cash'; // default
  }

  closePopup() {
    this.showPopup = false;
    this.type = '';
  }

  onImageSelect(event: any) {
    this.selectedImage = event.target.files[0];
  }

  // ================= SUBMIT =================
  submitTransaction() {

    if (!this.amount || this.amount <= 0) {
      alert('Enter valid amount');
      return;
    }

    if (!this.selectedBranch || this.selectedBranch === 'ALL') {
      alert('Please select branch');
      return;
    }

    const formData = new FormData();
    formData.append('transectionUserId', this.id);

    const payload = {
      Rs: Number(this.amount),
      paymentMode: this.paymentMode,
      description: this.description,
      billno: this.billno || null,
      returnDate: this.date,
      hotelBranchName: this.selectedBranch,
      updatedAt: new Date().toISOString() // ✅ include updatedAt
    };

    if (this.type === 'give') {
      formData.append('givenToAdmin', JSON.stringify(payload));
    } else {
      formData.append('takenFromAdmin', JSON.stringify(payload));
    }

    if (this.selectedImage) {
      formData.append('paymentScreenshoot', this.selectedImage);
    }

    this.http.post(
      'http://localhost:5000/api/admin/make-transection',
      formData,
      this.getHeaders()
    ).subscribe({
      next: () => {
        this.getTransactionRecord();
        this.closePopup();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Transaction failed');
      }
    });
  }

  // ================= IMAGE =================
  openImage(url: string) {
    window.open(url, '_blank');
  }
}
