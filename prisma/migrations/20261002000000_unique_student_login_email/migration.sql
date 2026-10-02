DROP INDEX "Student_email_idx";
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");