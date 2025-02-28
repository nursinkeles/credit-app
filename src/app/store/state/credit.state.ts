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
    // Tip dönüşümü yaparak uygulamalar döndür
    return state.applications.map((app) => ({
      id: app.id,
      firstName: app.firstName,
      lastName: app.lastName,
      applicationDate: app.applicationDate,
      creditType: app.creditType,
      creditAmount: app.creditAmount,
      status: app.status,
      identityNumber: app.identityNumber,
      phone: app.phone,
      phoneNumber: app.phone,
      income: app.income,
    }));
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

    // Hata ayıklama için loglama ekliyoruz
    console.log('Income:', application.income);
    console.log('Credit Amount:', application.creditAmount);
    console.log('5x Credit Amount:', application.creditAmount * 5);

    // Kredi başvuru durumunu belirle
    let status: 'PENDING' | 'APPROVED' | 'REJECTED';

    // Karşılaştırma için sayıları doğru şekilde işle
    const income = Number(application.income);
    const creditLimit = Number(application.creditAmount) * 5;

    if (income > creditLimit) {
      status = 'APPROVED';
    } else if (income === creditLimit) {
      status = 'PENDING';
    } else {
      status = 'REJECTED';
    }

    console.log('Calculated Status:', status);

    // Başvuru verilerine ID ve durum ekle
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
