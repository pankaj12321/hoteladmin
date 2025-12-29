import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.scss']
})
export class Attendance {

  staffList: any[] = [];
  filteredStaff: any[] = [];
  searchTerm: string = '';

  showModal = false;
  showEditModal = false;

  selectedStaff: any = null;
  selectedAttendance: string = '';
  selectedEditAttendance: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getStaffList();
  }

  // Load staff
  getStaffList() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>('Http://localhost:5000/api/admin/staff/get-list', { headers })
      .subscribe({
        next: res => {
          this.staffList = res.staffList.map((staff: any) => ({
            staffId: staff.staffId,
            firstName: staff.firstName,
            lastName: staff.lastName,
            mobile: staff.mobile,
            address: staff.address || { city: '' },
            branchName: staff.branchName,   // 👈 IMPORTANT
            attendance: 'Not Marked',
            attendanceMarked: false
          }));


          this.filteredStaff = [...this.staffList];
          this.getTodayAttendance();
        }
      });
  }

  getTodayAttendance() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const url = `Http://localhost:5000/api/admin/attendance/get/staff-att?month=${month}&year=${year}`;

    this.http.get<any>(url, { headers }).subscribe({
      next: res => {
        if (res && res.data) {

          const todayData = res.data.map((staff: any) => {

            const todayObj = staff.attendance?.[day];

            const todayStatus = todayObj?.attendance ?? '—';

            const isMarked = todayStatus !== '—';

            return {
              staffId: staff.staffId,
              attendance: todayStatus,
              attendanceMarked: isMarked
            };
          });


          this.staffList = this.staffList.map(s => {
            const found = todayData.find((a: any) => a.staffId === s.staffId);
            return found ? { ...s, ...found } : s;
          });

          this.filteredStaff = [...this.staffList];
        }
      }
    });
  }

  searchStaff() {
    const term = this.searchTerm.toLowerCase();
    this.filteredStaff = this.staffList.filter(
      s =>
        s.firstName.toLowerCase().includes(term) ||
        s.lastName.toLowerCase().includes(term) ||
        s.mobile.includes(term)
    );
  }

  // Open Mark Modal
  openAttendanceModal(staff: any) {
    this.selectedStaff = staff;
    this.selectedAttendance = '';
    this.showModal = true;
  }

  // Submit Attendance
  markSelectedAttendance() {
    if (!this.selectedAttendance) return alert('Select Attendance');

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const mapped =
      this.selectedAttendance === 'P' ? 'Present' :
        this.selectedAttendance === 'A' ? 'Absent' :
          this.selectedAttendance === 'H' ? 'Half Day' : 'Paid Leave';

    const payload = {
      staffId: this.selectedStaff.staffId,
      attendanceDetails: { attendance: mapped }
    };

    this.http.post('Http://localhost:5000/api/admin/attendance/marked-for-staff', payload, { headers })
      .subscribe({
        next: () => {
          alert('Attendance Marked!');
          this.selectedStaff.attendance = mapped;
          this.selectedStaff.attendanceMarked = true;
          this.closeModal();
        }
      });
  }

  closeModal() {
    this.showModal = false;
    this.selectedStaff = null;
    this.selectedAttendance = '';
  }

  // Open Edit Modal
  openEditModal(staff: any) {
    this.selectedStaff = staff;
    this.selectedEditAttendance = staff.attendance;
    this.showEditModal = true;
  }

  // Update Attendance
  updateAttendance() {
    if (!this.selectedEditAttendance) return alert('Select Attendance');

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const today = new Date();

    const payload = {
      staffId: this.selectedStaff.staffId,
      date: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      attendance: this.selectedEditAttendance
    };

    this.http.patch('Http://localhost:5000/api/admin/attendance/edit/staff-attendance', payload, { headers })
      .subscribe({
        next: () => {
          alert('Attendance Updated!');
          this.selectedStaff.attendance = this.selectedEditAttendance;
          this.closeEditModal();
        }
      });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedEditAttendance = '';
    this.selectedStaff = null;
  }
  filterByBranch(branch: string) {
  if (branch === 'ALL') {
    this.filteredStaff = [...this.staffList];
  } else {
    this.filteredStaff = this.staffList.filter(
      s => s.branchName === branch
    );
  }
}

}
