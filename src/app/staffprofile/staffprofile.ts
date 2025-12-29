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

      // ✅ staff milne ke baad attendance call karo
      this.getStaffAttendance();
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
      'Http://localhost:5000/api/admin/attendance/get/staff-att' +
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

      else if (att.attendance === 'PaidLeave') this.totalPaidLeave++;
    });

    // 🔥 YAHI par salary calculate karo
    this.calculateSalary();
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
calculateSalary() {
  if (!this.staffData?.salary) {
    this.calculatedSalary = 0;
    return;
  }

  const totalDays = this.getDaysInMonth(
    this.selectedMonth,
    this.selectedYear
  );

  this.monthlySalary = this.staffData.salary;
  this.perDaySalary = this.staffData.salary / totalDays;

  this.calculatedSalary =
    (this.totalPresent * this.perDaySalary) +
    (this.totalPaidLeave * this.perDaySalary) +
    (this.totalHalfDay * (this.perDaySalary / 2));
}

}
