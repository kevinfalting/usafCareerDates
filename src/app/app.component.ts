import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
import { Ranks } from './ranks';
import RankI from './ranks.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'USAF Career Dates';
  invalidDate = 'Invalid date';
  dateFormat = 'MMMM Do, YYYY';
  errorMessage = '';
  ranks: RankI[] = Ranks;

  tafms: moment.Moment;
  dor: moment.Moment;
  tis: number;
  tig: number;
  rank: string;
  contract: string;
  ftaContractEndDate: string;

  ngOnInit() {
    this.calculate();
  }

  calculate(): void {
    this.tafms = moment(
      (document.getElementById('tafms') as HTMLInputElement).value
    );
    this.dor = moment(
      (document.getElementById('dor') as HTMLInputElement).value
    );
    this.rank = (document.getElementById('rank') as HTMLInputElement).value;
  }

  tafmsIsValid(): boolean {
    return (
      moment.isMoment(this.tafms) && this.tafms.toString() !== this.invalidDate
    );
  }

  getTafmsDate(): string {
    return moment(this.tafms).format(this.dateFormat);
  }

  dorIsValid(): boolean {
    const dorIsValid =
      moment.isMoment(this.dor) && this.dor.toString() !== this.invalidDate;
    const tafmsIsValid = this.tafmsIsValid();
    if (tafmsIsValid && dorIsValid) {
      if (moment(this.tafms).isSameOrBefore(this.dor)) {
        this.errorMessage = '';
        return true;
      } else {
        this.errorMessage =
          'Date of Rank must be the same or after you entered the Air Force.';
        return false;
      }
    } else if (!tafmsIsValid && dorIsValid) {
      this.errorMessage = '';
      return true;
    } else {
      this.errorMessage = '';
      return false;
    }
  }

  getDorDate(): string {
    return moment(this.dor).format(this.dateFormat);
  }

  rankIsValid(): boolean {
    return this.rank !== '';
  }

  getNextRank(): string {
    for (let i = 0; i < this.ranks.length; i++) {
      if (this.rank === this.ranks[i].rank) {
        if (this.rank === this.ranks[this.ranks.length - 1].rank) {
          return this.rank;
        }
        return this.ranks[i + 1].rank;
      }
    }
  }

  getRetirementDate(): string {
    return moment(this.tafms)
      .add(20, 'y')
      .subtract(1, 'd')
      .format(this.dateFormat);
  }

  isFirstEnlistment(): boolean {
    this.setContractLength();
    this.setFtaContractEndDate();
    return (document.getElementById('fta') as HTMLInputElement).checked;
  }

  setContractLength(): void {
    const contract = document.getElementsByName('contract');
    for (let i = 0; i < contract.length; i++) {
      if ((contract[i] as HTMLInputElement).checked) {
        this.contract = (contract[i] as HTMLInputElement).value;
      }
    }
  }

  setFtaContractEndDate(): void {
    if (this.tafmsIsValid()) {
      this.ftaContractEndDate = moment(this.tafms)
        .add(this.contract, 'y')
        .subtract(1, 'd')
        .format(this.dateFormat);
    }
  }

  isBtzEligible(): boolean {
    if (
      this.isFirstEnlistment() &&
      (this.rank === this.ranks[0].rank ||
        this.rank === this.ranks[1].rank ||
        this.rank === this.ranks[2].rank)
    ) {
      return true;
    } else {
      return false;
    }
  }

  getHalfwayFtaDate(): string {
    return moment(this.tafms)
      .add(Number(this.contract) / 2, 'y')
      .format(this.dateFormat);
  }

  getRetrainWindow(): string {
    const windowOpen =
      this.contract === '4'
        ? moment(this.tafms)
            .add(35, 'M')
            .startOf('month')
            .format(this.dateFormat)
        : moment(this.tafms)
            .add(59, 'M')
            .startOf('month')
            .format(this.dateFormat);
    const windowClosed =
      this.contract === '4'
        ? moment(this.tafms)
            .add(43, 'M')
            .endOf('month')
            .format(this.dateFormat)
        : moment(this.tafms)
            .add(67, 'M')
            .endOf('month')
            .format(this.dateFormat);
    return `${windowOpen} - ${windowClosed}`;
  }

  getHighYearOfTenure(): string {
    const hyt = this.getCurrentRankInfo().hyt;
    return moment(this.tafms)
      .add(hyt, 'M')
      .format(this.dateFormat);
  }

  // returns the number of months this person has served.
  getTimeInService(): number {
    if (this.tafmsIsValid()) {
      return moment().diff(this.tafms, 'months');
    }
  }

  // returns how many months this person has held their rank.
  getTimeInGrade(): number {
    if (this.dorIsValid()) {
      return moment().diff(this.dor, 'months');
    }
  }

  getCurrentRankInfo(): RankI {
    for (let i = 0; i < this.ranks.length; i++) {
      if (this.rank === this.ranks[i].rank) {
        return this.ranks[i];
      }
    }
  }

  errorMessageIsActive(): boolean {
    this.dorIsValid();
    return this.errorMessage !== '';
  }

  isEligibleToTestForRank(): boolean {
    const rank = this.getCurrentRankInfo();
    if (
      rank.grade === 'E1' ||
      rank.grade === 'E2' ||
      rank.grade === 'E3' ||
      rank.grade === 'E9'
    ) {
      return false;
    }
    return true;
  }

  getEligibleToTestForPromotionDate(): string {
    const rank = this.getCurrentRankInfo();
    if (this.tafmsIsValid() && this.dorIsValid() && this.rankIsValid()) {
      const tig = moment(this.dor).add(rank.tig, 'M');
      let cutoffDate = moment()
        .month(Number(rank.cutoff) - 1)
        .endOf('month');
      while (moment.duration(tig.diff(cutoffDate)).asYears() > 1) {
        cutoffDate.add(1, 'year');
      }
      return cutoffDate.format(this.dateFormat);
    }
    return '';
  }
}
