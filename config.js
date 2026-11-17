// ---- EDIT THIS FILE when the timetable or section changes ----
// Timetable source: "Software Engg 1st Year" (generated 10/5/2026)
module.exports = {
  CLASS: "SE1",

  // P and L both count as "attended" (same as the original sheet). Use ["P"] for present only.
  COUNT_AS_ATTENDED: ["P", "L"],

  // weekday -> subjects that day. periods = number of periods of that subject that day
  // (every period counts as one class).
  TIMETABLE: {
    Mon: [
      { subject: "Applied Chemistry", periods: 1 },        // P1  Roma Yasmeen
      { subject: "Introduction PHP", periods: 1 },          // P2  Abdul Haseeb
      { subject: "Applied Mathematics-I", periods: 1 },     // P3  Shoaib Arif
      { subject: "HTML5 & CSS3", periods: 1 },              // P4  Abdul Haseeb
      { subject: "MS Office 2016 Lab", periods: 2 },        // P5-6 Shehzad Ali
    ],
    Tue: [
      { subject: "HTML5 & CSS3 Lab", periods: 2 },          // P1-2 Abdul Haseeb
      { subject: "Applied Mathematics-I", periods: 1 },     // P3  Shoaib Arif
      { subject: "SEO", periods: 1 },                       // P4  Shehzad Ali
      { subject: "SEO Lab", periods: 2 },                   // P5-6 Shehzad Ali
    ],
    Wed: [
      { subject: "Database Programming with MySQL", periods: 1 },      // P1 Mohsin Raza
      { subject: "English", periods: 1 },                              // P2 Syed Majid Ali
      { subject: "Applied Chemistry", periods: 1 },                    // P3 Roma Yasmeen
      { subject: "Database Programming with MySQL Lab", periods: 1 },  // P4 Mohsin Raza
      // P5 Extra Curricular Activity - no column in the summary sheet, so it is not counted
      { subject: "Applied Physics Lab", periods: 1 },                  // P6 Ghayoor Abbas
    ],
    Thu: [
      { subject: "MS Office 2016 Lab", periods: 1 },        // P1  Shehzad Ali
      { subject: "English", periods: 1 },                   // P2  Syed Majid Ali
      { subject: "Applied Chemistry Lab", periods: 2 },     // P3-4 Hafiza Rafia
      { subject: "Applied Physics", periods: 1 },           // P5  Ghayoor Abbas
      { subject: "MS Office 2016", periods: 1 },            // P6  Shehzad Ali
    ],
    Fri: [
      { subject: "MS Office 2016 Lab", periods: 1 },                       // P1 Shehzad Ali
      { subject: "Islamiat / Pak Studies", periods: 1 },                   // P2 Abuzar Malik
      { subject: "Intro PHP Lab", periods: 2 },                            // P3-4 Abdul Haseeb
      { subject: "Occupational Health, Safety & Environment", periods: 1 },// P5 Waqas Ali
    ],
  },

  // Column of the "Subject wise" sheet where each subject's count is written.
  // These letters are for the sheet AFTER the program adds the Lab columns
  // (HTML5 Lab, Intro PHP Lab, DB Prog. MYSQL Lab), so Theory and Lab are separate.
  SUBJECT_COLUMN: {
    "Islamiat / Pak Studies": "D",
    "English": "E",
    "Applied Mathematics-I": "F",
    "Applied Chemistry": "G",
    "Applied Chemistry Lab": "H",
    "Applied Physics": "I",
    "Applied Physics Lab": "J",
    "Occupational Health, Safety & Environment": "K",
    "MS Office 2016": "L",
    "MS Office 2016 Lab": "M",
    "HTML5 & CSS3": "N",
    "HTML5 & CSS3 Lab": "O",
    "Introduction PHP": "P",
    "Intro PHP Lab": "Q",
    "Database Programming with MySQL": "R",
    "Database Programming with MySQL Lab": "S",
    "SEO": "T",
    "SEO Lab": "U",
  },

  SUMMARY_SHEET: "Subject wise",
  FIRST_STUDENT_ROW: 10,
  TOTAL_ROW: 9,
};