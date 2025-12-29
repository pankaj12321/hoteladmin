import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-sprofile',
  templateUrl: './sprofile.html',
  styleUrls: ['./sprofile.scss']
})
export class Sprofile {

  /* ================= DATE FILTER ================= */
  selectedMonth: number | '' = '';
  selectedYear: number | '' = '';

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  years: number[] = [];

  /* ================= BASIC ================= */
  supplierId = '';
  supplierData: any = null;

  showForm = false;
  formType = '';
  loggedInBranch: string = '';

  transaction = {
    amount: 0,
    paymentMode: '',
    discription: '',
    billno: '',
    hotelBranchName: '',
    returnDate: '',
    updatedAt: ''
  };

  selectedImage: any = null;
  previewImage: string = '';

  takenList: any[] = [];
  givenList: any[] = [];

  allTakenList: any[] = [];
  allGivenList: any[] = [];

  totalTaken = 0;
  totalGiven = 0;

  selectedBranch: string = 'ALL';

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.loggedInBranch = localStorage.getItem('branchName') || '';
    this.supplierId = this.route.snapshot.paramMap.get('id') || '';
    this.getSupplierDetails();
    this.getTransactions();
  }

  getSupplierDetails() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get(
      `http://localhost:5000/api/admin/get/supplier-persons?supplierId=${this.supplierId}`,
      { headers }
    ).subscribe((res: any) => {
      this.supplierData = res.data[0];
    });
  }

  openForm(type: string) {
    this.formType = type;
    this.showForm = true;
    this.transaction.hotelBranchName = this.loggedInBranch;

    if (!this.transaction.updatedAt) {
      this.transaction.updatedAt = new Date().toISOString().split('T')[0];
    }
  }
  

  onFileSelect(event: any) {
    this.selectedImage = event.target.files[0];
  }

  submitTransaction() {
    if (!this.transaction.paymentMode) {
      alert('Payment mode select karo');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const formData = new FormData();
    formData.append('supplierId', this.supplierId);

    const payload: any = {
      Rs: this.transaction.amount,
      paymentMode: this.transaction.paymentMode,
      description: this.transaction.discription,
      billno: this.transaction.billno || null,
      hotelBranchName: this.transaction.hotelBranchName,
      updatedAt: this.transaction.updatedAt
    };

    if (this.transaction.returnDate) {
      payload.returnDate = this.transaction.returnDate;
    }

    if (this.formType === 'taken') {
      formData.append('takenFromAdmin', JSON.stringify(payload));
    } else {
      formData.append('givenToAdmin', JSON.stringify(payload));
    }

    if (this.selectedImage) {
      formData.append('paymentScreenshoot', this.selectedImage);
    }

    this.http.post(
      'http://localhost:5000/api/admin/make-supplier-transection',
      formData,
      { headers }
    ).subscribe(() => {
      this.showForm = false;
      this.selectedImage = null;

      this.transaction = {
        amount: 0,
        paymentMode: '',
        discription: '',
        billno: '',
        hotelBranchName: '',
        returnDate: '',
        updatedAt: ''
      };

      this.getTransactions();
    });
  }

  /* ================= GET TRANSACTIONS ================= */
  getTransactions() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get(
      `http://localhost:5000/api/admin/get/supplier-transection?supplierId=${this.supplierId}`,
      { headers }
    ).subscribe((res: any) => {
      const data = res.data;

      this.allTakenList = data.takenFromAdmin
        .map((t: any) => ({
          Rs: t.Rs,
          paymentMode: t.paymentMode,
          discription: t.description || '-',
          billno: t.billno || null,
          hotelBranchName: t.hotelBranchName || '-',
          entryDate: t.updatedAt,
          returnDate: t.returnDate || null,
          image: t.paymentScreenshoot
        }))
        .sort((a: any, b: any) =>
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
        );

      this.allGivenList = data.givenToAdmin
        .map((t: any) => ({
          Rs: t.Rs,
          paymentMode: t.paymentMode,
          discription: t.description || '-',
          billno: t.billno || null,
          hotelBranchName: t.hotelBranchName || '-',
          entryDate: t.updatedAt,
          returnDate: t.returnDate || null,
          image: t.paymentScreenshoot
        }))
        .sort((a: any, b: any) =>
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
        );

      this.extractYears();
      this.applyAllFilters();
    });
  }

  /* ================= YEAR LIST ================= */
  extractYears() {
    const dates = [
      ...this.allTakenList.map(t => t.entryDate),
      ...this.allGivenList.map(t => t.entryDate)
    ];

    this.years = Array.from(
      new Set(dates.map(d => new Date(d).getFullYear()))
    ).sort((a, b) => b - a);
  }

  /* ================= SINGLE FILTER FUNCTION ================= */
  applyAllFilters() {
    let taken = [...this.allTakenList];
    let given = [...this.allGivenList];

    if (this.selectedBranch !== 'ALL') {
      taken = taken.filter(t => t.hotelBranchName === this.selectedBranch);
      given = given.filter(t => t.hotelBranchName === this.selectedBranch);
    }

    if (this.selectedMonth !== '') {
      taken = taken.filter(t => new Date(t.entryDate).getMonth() === this.selectedMonth);
      given = given.filter(t => new Date(t.entryDate).getMonth() === this.selectedMonth);
    }

    if (this.selectedYear !== '') {
      taken = taken.filter(t => new Date(t.entryDate).getFullYear() === this.selectedYear);
      given = given.filter(t => new Date(t.entryDate).getFullYear() === this.selectedYear);
    }

    if (this.selectedYear !== '') {
      taken = taken.filter(t => new Date(t.entryDate).getFullYear() === this.selectedYear);
      given = given.filter(t => new Date(t.entryDate).getFullYear() === this.selectedYear);
    }

    this.takenList = taken;
    this.givenList = given;

    this.totalTaken = taken.reduce((s, t) => s + (t.Rs || 0), 0);
    this.totalGiven = given.reduce((s, t) => s + (t.Rs || 0), 0);
  }

  selectBranch(branch: string) {
    this.selectedBranch = branch;
    this.applyAllFilters();
  }

  openImage(img: string) {
    this.previewImage = img;
  }
  clearDateFilter() {
    this.selectedMonth = '';
    this.selectedYear = '';
    this.selectedBranch = 'ALL';
    this.applyAllFilters();
  }

}
