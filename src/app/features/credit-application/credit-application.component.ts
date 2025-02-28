import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormField } from '../../shared/models/form-field.model';
import { Store } from '@ngxs/store';
import { AddCreditApplication } from '../../store/actions/credit.actions';
import { CreditApplication } from '../../store/models/credit-application.model';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-credit-application',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    DropdownModule,
  ],
  providers: [MessageService],
  templateUrl: './credit-application.component.html',
  styleUrls: ['./credit-application.component.scss'],
})
export class CreditApplicationComponent implements OnInit {
  creditForm!: FormGroup;

  formFields: FormField[] = [
    {
      name: 'creditType',
      label: 'Kredi Türü',
      type: 'dropdown',
      validators: [Validators.required],
      errorMessages: {
        required: 'Kredi türü seçimi zorunludur',
      },
      class: 'col-12',
    },
    {
      name: 'firstName',
      label: 'Ad',
      type: 'text',
      validators: [Validators.required, Validators.minLength(2)],
      errorMessages: {
        required: 'Ad alanı zorunludur',
        minlength: 'Ad en az 2 karakter olmalıdır',
      },
      class: 'col-12',
    },
    {
      name: 'lastName',
      label: 'Soyad',
      type: 'text',
      validators: [Validators.required, Validators.minLength(2)],
      errorMessages: {
        required: 'Soyad alanı zorunludur',
        minlength: 'Soyad en az 2 karakter olmalıdır',
      },
      class: 'col-12',
    },
    {
      name: 'identityNumber',
      label: 'TC Kimlik No',
      type: 'identityNumber',
      validators: [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
      ],
      errorMessages: {
        required: 'TC Kimlik No zorunludur',
        minlength: 'TC Kimlik No 11 haneli olmalıdır',
        maxlength: 'TC Kimlik No 11 haneli olmalıdır',
      },
      class: 'col-12',
    },
    {
      name: 'phone',
      label: 'Telefon',
      type: 'phone',
      validators: [Validators.required, Validators.pattern(/^5[0-9]{9}$/)],
      errorMessages: {
        required: 'Telefon numarası zorunludur',
        pattern: 'Geçerli bir telefon numarası giriniz',
      },
      placeholder: '5XX XXX XX XX',
      class: 'col-12',
    },
    {
      name: 'monthlyIncome',
      label: 'Aylık Gelir',
      type: 'currency',
      validators: [Validators.required, Validators.min(0)],
      errorMessages: {
        required: 'Aylık gelir zorunludur',
        min: "Aylık gelir 0'dan büyük olmalıdır",
      },
      class: 'col-12',
    },
    {
      name: 'requestedAmount',
      label: 'Talep Edilen Kredi Tutarı',
      type: 'currency',
      validators: [Validators.required, Validators.min(1000)],
      errorMessages: {
        required: 'Kredi tutarı zorunludur',
        min: 'Kredi tutarı en az 1.000 TL olmalıdır',
      },
      class: 'col-12',
    },
  ];

  creditTypeOptions = [
    { label: 'İhtiyaç Kredisi', value: 'PERSONAL' },
    { label: 'Taşıt Kredisi', value: 'VEHICLE' },
    { label: 'Konut Kredisi', value: 'MORTGAGE' },
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private store: Store
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const group: any = {};
    this.formFields.forEach((field) => {
      group[field.name] = ['', field.validators];
    });
    this.creditForm = this.fb.group(group);
    this.creditForm.get('creditType')?.setValue('PERSONAL');
  }

  onSubmit() {
    this.markFormGroupTouched(this.creditForm);

    if (this.creditForm.valid) {
      const formValue = this.creditForm.value;

      const creditApplication: CreditApplication = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        identityNumber: formValue.identityNumber,
        phone: formValue.phone,
        income: Number(formValue.monthlyIncome),
        creditAmount: Number(formValue.requestedAmount),
        creditType: formValue.creditType,
        applicationDate: new Date(),
        status: 'PENDING',
        id: '',
      };

      const result = this.store
        .dispatch(new AddCreditApplication(creditApplication))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail:
                'Kredi başvurunuz alınmıştır. En kısa sürede size dönüş yapılacaktır.',
              life: 5000,
            });

            this.creditForm.reset();
            this.markFormGroupUntouched(this.creditForm);
          },
          error: (err) => {
            console.error('Başvuru kaydedilirken hata oluştu', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: 'Başvurunuz kaydedilirken bir sorun oluştu.',
              life: 5000,
            });
          },
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Lütfen form alanlarını kontrol ediniz.',
        life: 5000,
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private markFormGroupUntouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsUntouched();
      if (control instanceof FormGroup) {
        this.markFormGroupUntouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.creditForm.get(fieldName);
    const field = this.formFields.find((f) => f.name === fieldName);

    if (control && field && control.errors && control.touched) {
      const firstError = Object.keys(control.errors)[0];
      return field.errorMessages[firstError] || 'Geçersiz değer';
    }
    return '';
  }
}
