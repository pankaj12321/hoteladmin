import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-expensis',
  templateUrl: './expensis.html',
  styleUrls: ['./expensis.scss']
})
export class Expensis {
  activeDiv: string = "customer";
  customers: any[] = [];
  filteredCustomers: any[] = [];
  searchText: string = "";
  showModal: boolean = false;

  form = {
    name: "",
    mobile: "",
    city: ""
  };

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.getCustomers();
    const savedBranch = localStorage.getItem('branchName');
    if (savedBranch) {
      this.selectedBranch = savedBranch;
      this.expenseForm.branch = savedBranch;
      this.earningForm.branch = savedBranch;
    }
  }

  openDiv(div: string) {
    this.activeDiv = div;

    if (div === "customer") {
      this.getCustomers();
    }

    if (div === "expense") {
      this.getHotelExpenseReport();
    }

    if (div === "supplier") {
      this.getSuppliers();
    }
  }


  getHeaders() {
    const token = localStorage.getItem("token") || "";
    return {
      headers: { Authorization: "Bearer " + token }
    };
  }
  getCustomers() {
    this.http.get("Http://localhost:5000/api/admin/get/transection-user", this.getHeaders())
      .subscribe({
        next: (res: any) => {
          this.customers = res.data || res;
          this.filteredCustomers = [...this.customers];
        },
      });
  }

  filterCustomers() {
    const text = this.searchText.toLowerCase().trim();
    this.filteredCustomers = this.customers.filter(c =>
      c.name?.toLowerCase().includes(text) ||
      c.mobile?.toLowerCase().includes(text)
    );
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.form = { name: "", mobile: "", city: "" };
  }

  submitCustomer() {
    const payload = {
      name: this.form.name,
      mobile: this.form.mobile,
      address: { city: this.form.city }
    };

    this.http.post("Http://localhost:5000/api/admin/create-transection-user", payload, this.getHeaders())
      .subscribe({
        next: () => {
          this.closeModal();
          this.getCustomers();
        },
      });
  }

  navigateToProfile(cust: any) {
    this.router.navigate(['/home/cprofile', cust.transectionUserId]);
  }

  hotelExpenses: any[] = [];
  hotelEarnings: any[] = [];

  totalMonthlyEarnings: number = 0;
  totalMonthlyExpenses: number = 0;

  showAddExpenseForm: boolean = false;
  showAddEarningForm: boolean = false;

  expenseForm = {
    amount: "",
    items: "",
    date: "",
    mode: "cash",
    billno: "",
    description: "",
    time: "",
    branch: 'Gokulpura'
  };

  earningForm = {
    amount: "",
    details: "",
    date: "",
    mode: "cash",
    time: "",
    billno: "",
    description: "",
    branch: 'Gokulpura'
  };
  selectedEarningImage: File | null = null;
  selectedExpenseImage: File | null = null;

  onEarningImageSelect(event: any) {
    this.selectedEarningImage = event.target.files[0];
  }

  onExpenseImageSelect(event: any) {
    this.selectedExpenseImage = event.target.files[0];
  }
  branches = [
    'Gokulpurabranch',
    'Sikarbranch',
    'Sawlibranch'
  ];

  selectedBranch: string = 'Gokulpura';
  changeBranch(branch: string) {
    this.selectedBranch = branch;
    this.expenseForm.branch = branch;
    this.earningForm.branch = branch;
    this.getHotelExpenseReport(branch);
  }

  getHotelExpenseReport(branch?: string) {
    const b = branch || this.selectedBranch;
    this.http.get(
      `Http://localhost:5000/api/admin/get/earning-expense-report?hotelBranchName=${this.selectedBranch}`,
      this.getHeaders()
    ).subscribe({
      next: (res: any) => {
        const data = res.data || {};
        this.hotelEarnings = (data.earnings || []).map((e: any) => ({
          ...e,
          _id: e._id
        }));

        this.hotelExpenses = (data.expenses || []).map((e: any) => ({
          ...e,
          _id: e._id
        }));
        this.hotelEarnings = data.earnings || [];
        this.hotelExpenses = data.expenses || [];
        this.totalMonthlyEarnings = Number(data.totalEarning) || 0;
        this.totalMonthlyExpenses = Number(data.totalExpense) || 0;
      }
    });
  }

  addExpense() {
    const formData = new FormData();
    formData.append("expenseAmount", String(this.expenseForm.amount));
    formData.append("expenseItems", this.expenseForm.items);
    formData.append("expenseDate", this.expenseForm.date);
    formData.append("paymentMode", this.expenseForm.mode);
    formData.append("billno", String(this.expenseForm.billno));
    formData.append("discription", this.expenseForm.description);
    formData.append("time", this.expenseForm.time);
    formData.append("hotelBranchName", this.expenseForm.branch);


    if (this.selectedExpenseImage) {
      formData.append("paymentScreenshoot", this.selectedExpenseImage);
    }
    const token = localStorage.getItem('token');

    this.http.post(
      "Http://localhost:5000/api/admin/add/hotel-expense",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe({
      next: () => {
        this.showAddExpenseForm = false;
        this.getHotelExpenseReport();
      },
    });
  }

  addEarning() {
    const formData = new FormData();
    formData.append("earningAmount", String(this.earningForm.amount));
    formData.append("earningDetails", this.earningForm.details);
    formData.append("earningDate", this.earningForm.date);
    formData.append("paymentMode", this.earningForm.mode);
    formData.append("billno", String(this.earningForm.billno));  // BILL NO
    formData.append("discription", this.earningForm.description);
    formData.append("time", this.earningForm.time);
    formData.append("hotelBranchName", this.earningForm.branch);



    if (this.selectedEarningImage) {
      formData.append("paymentScreenshoot", this.selectedEarningImage);
    }
    const token = localStorage.getItem('token');
    this.http.post(
      "Http://localhost:5000/api/admin/add/hotel-earning",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe({
      next: () => {
        alert("Earning Added!");
        this.showAddEarningForm = false;
        this.getHotelExpenseReport();
      },
    });
  }

  suppliers: any[] = [];
  filteredSuppliers: any[] = [];
  supplierSearchText: string = "";
  showSupplierForm: boolean = false;
  supplierForm = {
    supplierName: "",
    supplierCompany: "",
    supplierPhone: ""
  };

  // GET SUPPLIERS LIST
  getSuppliers() {
    this.http.get("Http://localhost:5000/api/admin/get/supplier-persons", this.getHeaders())
      .subscribe({
        next: (res: any) => {
          if (Array.isArray(res?.data)) {
            this.suppliers = res.data;
          }
          else if (Array.isArray(res)) {
            this.suppliers = res;
          }
          else {
            this.suppliers = [];
          }

          this.filteredSuppliers = [...this.suppliers];
        },
      });
  }

  filterSuppliers() {
    const t = this.supplierSearchText.toLowerCase().trim();
    this.filteredSuppliers = this.suppliers.filter(s =>
      s.supplierName?.toLowerCase().includes(t) ||
      s.supplierCompany?.toLowerCase().includes(t) ||
      s.supplierPhone?.toLowerCase().includes(t)
    );
  }

  // OPEN FORM
  openSupplierForm() {
    this.showSupplierForm = true;
  }

  // CLOSE FORM
  closeSupplierForm() {
    this.showSupplierForm = false;
    this.supplierForm = {
      supplierName: "",
      supplierCompany: "",
      supplierPhone: ""
    };
  }

  // SUBMIT SUPPLIER
  submitSupplier() {
    const payload = {
      supplierName: this.supplierForm.supplierName,
      supplierCompany: this.supplierForm.supplierCompany,
      supplierPhone: this.supplierForm.supplierPhone
    };

    this.http.post("Http://localhost:5000/api/admin/add/supplier-person", payload, this.getHeaders())
      .subscribe({
        next: () => {

          this.closeSupplierForm();
          this.getSuppliers();
        },
      });
  }
  openSupplierProfile(id: string) {
    this.router.navigate(['/home/sprofile', id]);
  }
  showImageModal: boolean = false;
  previewImageUrl: string = '';

  openImage(url: string) {
    window.open(url, "_blank");
  }
  closeImageModal() {
    this.showImageModal = false;
  }

  deleteEarningExpense(e: any, type: 'earnings' | 'expenses') {

    if (!e || !e._id) {
      alert('Entry ID missing');
      return;
    }

    const confirmDelete = confirm('Are you sure you want to delete this entry?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      type: type,
      objId: e._id
    };

    console.log('DELETE EARNING/EXPENSE 👉', payload);

    this.http.request(
      'DELETE',
      'http://localhost:5000/api/admin/delete/earning-expense-entry',
      {
        body: payload,
        headers
      }
    ).subscribe({
      next: () => {
        alert('Deleted successfully');
        this.getHotelExpenseReport(); // 🔁 refresh
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Delete failed');
      }
    });
  }
}
