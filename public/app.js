function gpaApp() {
  return {
    gpas: [],
    years: [],
    selectedYear: '',
    page: 1,
    perPage: 10,

    async init() {
      try {
        const res = await fetch('/api/gpa');
        const data = await res.json();
        this.gpas = data;
        this.extractYears();
      } catch (err) {
        console.error('Error fetching GPA:', err);
      }
    },

    extractYears() {
      const yearSet = new Set(this.gpas.map(g => g.year));
      this.years = Array.from(yearSet).sort();
    },

    filteredAndSortedGPA() {
      let filtered = [...this.gpas];
      if (this.selectedYear) {
        const selected = filtered.filter(g => g.year === this.selectedYear);
        const rest = filtered.filter(g => g.year !== this.selectedYear);
        filtered = [...selected, ...rest];
      }

      const start = (this.page - 1) * this.perPage;
      return filtered.slice(start, start + this.perPage);
    },

    totalPages() {
      let count = this.gpas.length;
      if (this.selectedYear) {
        count = this.gpas.filter(g => g.year === this.selectedYear).length + 
                this.gpas.filter(g => g.year !== this.selectedYear).length;
      }
      return Math.ceil(count / this.perPage);
    },

    nextPage() {
      if (this.page < this.totalPages()) this.page++;
    },

    prevPage() {
      if (this.page > 1) this.page--;
    }
  }
}
