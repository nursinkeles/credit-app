import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { CreditApplication } from '../models/credit-application.model';
import {
  AddCreditApplication,
  UpdateCreditApplicationStatus,
} from '../actions/credit.actions';

export interface CreditStateModel {
  applications: CreditApplication[];
  loading: boolean;
}

@State<CreditStateModel>({
  name: 'credit',
  defaults: {
    applications: [],
    loading: false,
  },
})
@Injectable()
export class CreditState {
  @Selector()
  static getApplications(state: CreditStateModel) {
    return state.applications;
  }

  @Selector()
  static isLoading(state: CreditStateModel) {
    return state.loading;
  }

  @Action(AddCreditApplication)
  addApplication(
    ctx: StateContext<CreditStateModel>,
    action: AddCreditApplication
  ) {
    const state = ctx.getState();
    const application = action.payload;

    let status: 'PENDING' | 'APPROVED' | 'REJECTED';

    const income = Number(application.income);
    const creditLimit = Number(application.creditAmount) * 5;

    if (income > creditLimit) {
      status = 'APPROVED';
    } else if (income === creditLimit) {
      status = 'PENDING';
    } else {
      status = 'REJECTED';
    }

    const newApplication: CreditApplication = {
      ...application,
      id: this.generateId(),
      applicationDate: new Date(),
      status: status,
    };

    ctx.patchState({
      applications: [...state.applications, newApplication],
    });

    return newApplication;
  }

  @Action(UpdateCreditApplicationStatus)
  updateStatus(
    ctx: StateContext<CreditStateModel>,
    action: UpdateCreditApplicationStatus
  ) {
    const state = ctx.getState();
    const applications = state.applications.map((app) => {
      if (app.id === action.id) {
        return { ...app, status: action.status };
      }
      return app;
    });

    ctx.patchState({
      applications: applications,
    });
  }

  private generateId(): string {
    return Date.now().toString() + Math.floor(Math.random() * 1000);
  }
}
