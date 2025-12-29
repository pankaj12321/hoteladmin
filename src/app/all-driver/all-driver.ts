import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-driver',
  templateUrl: './all-driver.html',
  styleUrls: ['./all-driver.scss']
})
export class AllDriver {
  drivers: any[] = [];
  filteredDrivers: any[] = [];

  fromDate: string = '';
  toDate: string = '';
  entryFilter: string = '';
  searchTerm: string = '';

  entryRanges = ['5-10', '10-15', '15-20', '20-25', '25-30', '30-40'];

  reminderMessage: string =
    'नमस्ते, {name} जी आपका सहयोग हमारे लिए हमेशा मूल्यवान रहा है जब भी आप किसी पार्टी के साथ इस ओर आएं BL Poonam Hotel & Restaurant में रुकने का अवसर ज़रूर दें आपकी हर यात्रा सुखद और सफल रहे यही हमारी शुभकामनाएँ हैं (टीम BL Poonam Hotel & Restaurant)';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.getDrivers();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getHeaders() {
    const token = this.getToken();
    if (!token) this.router.navigate(['/login']);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getDrivers() {
    this.http
      .get<any>('Http://localhost:5000/api/admin/get-drivers', {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (res) => {
          let list = res.drivers || [];
          this.drivers = list.map((d: any) => ({
            ...d,
            name: d.name,
          }));
          this.filteredDrivers = this.drivers;
          this.drivers.forEach((driver) => this.getDriverEntries(driver));
        },
        error: (err) => console.error(err),
      });
  }

  getDriverEntries(driver: any) {
    console.log("entry");

    this.http
      .get<any>('Http://localhost:5000/api/admin/get-driver-commision-entries', {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (res) => {
          const allEntries = res.entries || [];

          const driverEntries = allEntries.filter(
            (e: any) => e.driverId === driver._id
          );

          driver.totalEntries = driverEntries.length;
          if (driverEntries.length > 0) {
            const latest = driverEntries
              .map((x: any) => new Date(x.entryDate))
              .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0];

            driver.latestEntryDate = latest;
          }

          this.applyFilters();
        },
        error: (err) =>
          console.error('Commission entries fetch error:', err),
      });
  }

  // 🔥 Filters
  applyFilters() {
    this.filteredDrivers = this.drivers.filter((d) => {
      let dateCheck = true;
      let entryCheck = true;
      let searchCheck = true;

      // Search by name or mobile
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        searchCheck =
          (d.name && d.name.toLowerCase().includes(term)) ||
          (d.mobile && d.mobile.toLowerCase().includes(term));
      }

      // Date filter
      if (this.fromDate && this.toDate && d.createdAt) {
        const date = new Date(d.createdAt);
        dateCheck =
          date >= new Date(this.fromDate) &&
          date <= new Date(this.toDate);
      }

      // Entry count filter
      if (this.entryFilter) {
        const [min, max] = this.entryFilter.split('-').map(Number);
        entryCheck =
          (d.totalEntries || 0) >= min &&
          (d.totalEntries || 0) <= max;
      }

      return dateCheck && entryCheck && searchCheck;
    });
  }

  // 🔥 WhatsApp Reminder
  sendWhatsAppReminder(driver: any) {
    if (!driver.mobile) {
      alert('Driver mobile number missing!');
      return;
    }

    const phone = driver.mobile.startsWith('+')
      ? driver.mobile
      : '91' + driver.mobile;

    const msg = this.reminderMessage.replace('{name}', driver.name);

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }
}
