import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-staffprofile',
  templateUrl: './staffprofile.html',
  styleUrls: ['./staffprofile.scss']
})
export class Staffprofile {
  staffId: string = '';
  staffData: any = null;
  loading: boolean = true;
  monthlySalary = 0;
  perDaySalary = 0;
  calculatedSalary = 0;

  // ID preview
  showIdPreview: boolean = false;

  // 📅 Attendance related
  selectedMonth!: number;
  selectedYear!: number;

  attendanceDays: any[] = [];

  totalPresent = 0;
  totalAbsent = 0;
  totalHalfDay = 0;
  totalPaidLeave = 0;

  // 📕 Khatabook related
  khatabookData: any = null;

  showTransactionModal: boolean = false;
  transactionType: 'given' | 'taken' = 'given';
  transactionForm: {
    Rs: number;
    paymentMode: string;
    description: string;
    hotelBranchName: string;
    billno: string | number | null;
    returnDate: string | null;
  } = {
      Rs: 0,
      paymentMode: 'cash',
      description: '',
      hotelBranchName: '',
      billno: null,
      returnDate: null
    };
  selectedFile: File | null = null;


  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedYear = today.getFullYear();

    this.staffId = this.route.snapshot.paramMap.get('id') || '';

    if (this.staffId) {
      this.getStaffDetail();
      this.getStaffAttendance();
      this.getStaffKhatabook();
    }
  }
  getStaffDetail() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any>(
      `http://localhost:5000/api/admin/staff/get-list?staffId=${this.staffId}`,
      { headers }
    ).subscribe({
      next: (res) => {
        this.staffData = res.staffList?.length ? res.staffList[0] : null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }


  getStaffAttendance() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const url =
      'http://localhost:5000/api/admin/attendance/get/staff-att' +
      `?month=${this.selectedMonth}&year=${this.selectedYear}`;

    this.http.get<any>(url, { headers }).subscribe({
      next: (res) => {
        if (!res?.data || !Array.isArray(res.data)) return;

        const staff = res.data.find(
          (s: any) => s.staffId === this.staffId
        );

        if (!staff || !staff.attendance) return;

        this.attendanceDays = [];
        this.resetTotals();

        Object.keys(staff.attendance).forEach((day: any) => {
          const att = staff.attendance[day];

          this.attendanceDays.push({
            day,
            status: att.attendance || '—',
            time: att.time || '—'
          });

          if (att.attendance === 'Present') this.totalPresent++;
          else if (att.attendance === 'Absent') this.totalAbsent++;
          else if (
            att.attendance === 'HalfDay' ||
            att.attendance === 'Half Day'
          ) {
            this.totalHalfDay++;
          }

          else if (att.attendance === 'PaidLeave' || att.attendance === 'Paid Leave') this.totalPaidLeave++;
        });

        // 🔥 Backend Salary calculation
        this.fetchCalculatedSalary();
      }
    });
  }

  fetchCalculatedSalary() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any>(
      `http://localhost:5000/api/admin/staff/calculate-salary?staffId=${this.staffId}&month=${this.selectedMonth}&year=${this.selectedYear}`,
      { headers }
    ).subscribe({
      next: (res) => {
        this.calculatedSalary = res.calculatedSalary;
        this.monthlySalary = res.currentBaseSalary;
        this.perDaySalary = res.currentBaseSalary / this.getDaysInMonth(this.selectedMonth, this.selectedYear);
      }
    });
  }

  getStaffKhatabook() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any>(
      `http://localhost:5000/api/admin/staff/khatabook/get-details?staffId=${this.staffId}`,
      { headers }
    ).subscribe({
      next: (res) => {
        this.khatabookData = res.khatabook;
      },
      error: () => {
        this.khatabookData = null;
      }
    });
  }

  openTransactionModal(type: 'given' | 'taken') {
    this.transactionType = type;
    this.showTransactionModal = true;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  addTransaction() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const formData = new FormData();
    formData.append('staffId', this.staffId);
    formData.append('type', this.transactionType);
    formData.append('Rs', this.transactionForm.Rs.toString());
    formData.append('paymentMode', this.transactionForm.paymentMode);
    formData.append('description', this.transactionForm.description);
    if (this.transactionForm.hotelBranchName) formData.append('hotelBranchName', this.transactionForm.hotelBranchName);
    if (this.transactionForm.billno) formData.append('billno', this.transactionForm.billno.toString());
    if (this.transactionForm.returnDate) formData.append('returnDate', this.transactionForm.returnDate);
    if (this.selectedFile) {
      formData.append('paymentScreenshoot', this.selectedFile);
    }

    this.http.post<any>(
      `http://localhost:5000/api/admin/staff/khatabook/add-transaction`,
      formData,
      { headers }
    ).subscribe({
      next: () => {
        this.showTransactionModal = false;
        this.getStaffKhatabook();
        // Reset form
        this.transactionForm = {
          Rs: 0,
          paymentMode: 'cash',
          description: '',
          hotelBranchName: '',
          billno: null,
          returnDate: null
        };
        this.selectedFile = null;
      }
    });
  }

  resetTotals() {
    this.totalPresent = 0;
    this.totalAbsent = 0;
    this.totalHalfDay = 0;
    this.totalPaidLeave = 0;
  }
  onMonthChange(event: any) {
    this.selectedMonth = +event.target.value;
    this.getStaffAttendance();
  }

  onYearChange(event: any) {
    this.selectedYear = +event.target.value;
    this.getStaffAttendance();
  }
  openIdImage() {
    this.showIdPreview = true;
  }

  closeIdImage() {
    this.showIdPreview = false;
  }

  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }


}
