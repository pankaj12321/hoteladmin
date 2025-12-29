import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-khatabookprofile',
  templateUrl: './khatabookprofile.html',
  styleUrls: ['./khatabookprofile.scss']
})
export class Khatabookprofile {
   personalId!: string;

  showForm: boolean = false;
  formType: 'taken' | 'given' = 'taken'; // which form is open

  transaction: any = {
    taken: { amount:'', paymentMode:'', billno:'', returnDate:'', description:'' },
    given: { amount:'', paymentMode:'', billno:'', returnDate:'', description:'' }
  };

  selectedFile: File | null = null;

  // Transaction history arrays
  takenFromAdmin: any[] = [];
  givenToAdmin: any[] = [];

  // Totals
  totalTaken: number = 0;
  totalGiven: number = 0;
  balance: number = 0;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.personalId = this.route.snapshot.paramMap.get('id')!;
    this.loadTransactions();
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /** OPEN FORM */
  openForm(type: 'taken' | 'given') {
    this.formType = type;
    this.showForm = true;
  }

  /** CLOSE FORM */
  closeForm() {
    this.showForm = false;
    this.selectedFile = null;
  }

  /** FILE SELECT */
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  /** ADD TRANSACTION */
  makeTransaction() {
    if (!this.personalId) return alert("Personal ID missing");

    const formData = new FormData();
    formData.append('personalTransectionalUserId', this.personalId);

    const dataKey = this.formType === 'taken' ? 'takenFromAdmin' : 'givenToAdmin';
    const data = this.transaction[this.formType];

    formData.append(`${dataKey}[Rs]`, data.amount);
    formData.append(`${dataKey}[paymentMode]`, data.paymentMode);
    formData.append(`${dataKey}[billno]`, data.billno);
    formData.append(`${dataKey}[returnDate]`, data.returnDate);
    formData.append(`${dataKey}[description]`, data.description);

    if (this.selectedFile) {
      formData.append('paymentScreenshoot', this.selectedFile);
    }

    this.http.post('Http://localhost:5000/api/admin/make/personal/user/transection', formData, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert('Transaction added successfully!');
          this.transaction[this.formType] = { amount:'', paymentMode:'', billno:'', returnDate:'', description:'' };
          this.selectedFile = null;
          this.showForm = false;
          this.loadTransactions(); // refresh history
        },
        error: (err) => {
          console.error('Transaction Error', err);
          alert('Failed to add transaction');
        }
      });
  }

  /** LOAD TRANSACTION HISTORY */
 loadTransactions() {
  if (!this.personalId) return;

  const url = `Http://localhost:5000/api/admin/get/personal/transectional/record?personalTransectionalUserId=${this.personalId}`;
  this.http.get<any>(url, { headers: this.getHeaders() })
    .subscribe({
      next: (res) => {
        const data = res.data;
        this.takenFromAdmin = data?.takenFromAdmin || [];
        this.givenToAdmin = data?.givenToAdmin || [];

        // calculate totals
        this.totalTaken = this.takenFromAdmin.reduce((sum, t) => sum + Number(t.Rs), 0);
        this.totalGiven = this.givenToAdmin.reduce((sum, t) => sum + Number(t.Rs), 0);
        this.balance = this.totalTaken - this.totalGiven;

      },
      error: (err) => {
        console.error('Transaction fetch error', err);
      }
    });
}


}
