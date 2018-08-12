export default interface Rank {
  rank: string; // Name of rank
  grade: string; // Grade ie: E5
  hyt: string; // High Year of Tenure (months) from TAFMS
  tis: string; // Time In Service requirement (months)
  tig: string; // Time In Grade requirement (months)
  cutoff?: string; // Cutoff date to test for next rank. (MM) Go to the last day of the month.
  retainability?: string; // To put on this rank, you must have this many months of retainability. (months)
  scod: string; // EPR Static Close Out Date. (MM) Go to the last day of the month.
}
