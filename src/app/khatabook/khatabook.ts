import { Component } from '@angular/core';
import { HttpClient , HttpHeaders  } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-khatabook',
  templateUrl: './khatabook.html',
  styleUrls: ['./khatabook.scss']
})
export class Khatabook {
 
 
  peopleList: any[] = [];
  filteredList: any[] = [];
  searchText = '';

  newPerson = {
    name: '',
    mobile: '',
    email: ''
  };

  showAddForm = false;

  constructor(
    private http: HttpClient,
    private router: Router   // 👈 MUST inject
  ) {}

  ngOnInit(): void {
    this.loadPeople();
  }

  /** 🔐 HEADER WITH TOKEN */
  getHeaders() {
    const token = localStorage.getItem('token'); // login ke baad save hona chahiye
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /** ✅ GET PEOPLE */
  loadPeople() {
    this.http.get<any>(
      'Http://localhost:5000/api/admin/get/personal/transectional/user',
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        this.peopleList = res.data ? res.data : res;
        this.filteredList = this.peopleList;
      },
      error: (err) => {
        console.error('GET ERROR', err);
      }
    });
  }

  /** 🔍 SEARCH */
  searchPeople() {
    const value = this.searchText.toLowerCase();
    this.filteredList = this.peopleList.filter(p =>
      p.name?.toLowerCase().includes(value) ||
      p.mobile?.includes(value)
    );
  }

  /** ➕ ADD PERSON */
  addPerson() {
    this.http.post(
      'Http://localhost:5000/api/admin/add/earExp/subject',
      this.newPerson,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.loadPeople();
        this.newPerson = { name: '', mobile: '', email: '' };
        this.showAddForm = false;
      },
      error: (err) => {
        console.error('POST ERROR', err);
      }
    });
  }

  /** 👉 OPEN PROFILE */
  openProfile(personalId: string) {
    this.router.navigate(['/home/khatabookprofile', personalId]);
  }
}
