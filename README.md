# Subject-wise attendance (Node.js)

1. Install Node.js (LTS) from https://nodejs.org
2. In this folder run:  `npm install`
3. Put the attendance file and the Test - Regular file in the folder, then run:

   node index.js "attendance.xlsx" "Test - Regular.xlsx" output.xlsx --students attendance

The output is the Test - Regular sheet with the counts filled in (no extra sheets).
Theory and Lab have separate columns, and every period counts as one class
(a 2-period lab on one day = 2 classes).

Add `--students attendance` to take the student rows from the attendance file.
Without it the template's own students are kept and matched by GR No.

Change the timetable (days, subjects, periods), class name, or what counts as attended in `config.js`.


# EXAMPLE:
node index.js "SMARTI DAE Attendance - October 2026 - SE1.xlsx" "Test - Regular.xlsx" output.xlsx --students attendance