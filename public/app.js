// function marksApp() {
//     return {
//         marks: [],
//         page: 1,
//         totalPages: 1,
//         showInsertModal: false,
//         showEditModal: false,
//         form: { hid: '', regno: '', marks: '', rid: '', mid: null },

//         async fetchMarks() {
//             try {
//                 const res = await fetch(`/api/marks?page=${this.page}`);
//                 const data = await res.json();
//                 this.marks = data.rows;
//                 this.totalPages = Math.ceil(data.total / 100); // assuming 100 per page
//             } catch (e) {
//                 console.error('Error:', e);
//             }
//         },

//         nextPage() {
//             if (this.page < this.totalPages) {
//                 this.page++;
//                 this.fetchMarks();
//             }
//         },
//         prevPage() {
//             if (this.page > 1) {
//                 this.page--;
//                 this.fetchMarks();
//             }
//         },

//     }

// }
// // 

function gpaApp() {
  return {
    gpas: [],
    async fetchGPA() {
      try {
        const res = await fetch('/api/gpa');
        this.gpas = await res.json();
      } catch (e) {
        console.error('Fetch GPA error:', e);
      }
    },
    init() {
      this.fetchGPA();
    }
  }
}
