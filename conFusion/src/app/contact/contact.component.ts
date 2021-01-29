import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { FeedbackService } from '../services/feedback.service';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { flyInOut, expand, visibility, loaderVisibility, formVisibility } from '../animations/app.animation';

@Component({
  selector		: 'app-contact',
  templateUrl	: './contact.component.html',
  styleUrls		: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [flyInOut(), expand(), visibility(), loaderVisibility(), formVisibility()]
})
export class ContactComponent implements OnInit {

  feedbackForm  : FormGroup;
  feedback      : Feedback;
  feedbackCopy  : Feedback;
  errMsg        : string;
  contactType   = ContactType;
  visibility   = 'shown';
  loaderVisibility  = 'hidden';
  formVisibility = 'hidden';
  @ViewChild('fform') feedbackFormDirective;

  formErrors = {
    'firstname'	: '',
    'lastname'	:	'',
    'telnum'		: '',
    'email'			: ''		
  };

  validationMessages = {
    'firstname'	: {
      'required'	: 'First name is required.',
      'minlength'	: 'First name must be atleast 2 characters long.',
      'maxlength'	: 'First name can not be more than 30 characters.'
    },
    'lastname'	: {
      'required'	: 'Last name is required.',
      'minlength'	: 'Last name must be atleast 2 characters long.',
      'maxlength'	: 'Last name can not be more than 30 characters.'
    },
    'telnum' : {
      'required'	: 'Tel. number is required.',
      'pattern'		: 'Tel. number must contain only numbers.'
    },
    'email'	: {
      'required'	: 'Email is required.',
      'email'			: 'Email format is not valid.'
    },
  };

  constructor(private fb: FormBuilder,
    private fbService: FeedbackService,
    private route: ActivatedRoute,
    private location: Location,
    @Inject('BaseURL') private BaseURL) {
    this.createForm();
  }

  ngOnInit() { 
    this.fbService.getFeedback()
			.subscribe((feedback) => this.feedback = feedback);
		this.route.params
			.pipe(switchMap((params: Params) => {
        this.loaderVisibility = 'hidden';
        this.formVisibility = 'hidden';
        return this.fbService.getFeedback()
      } ))
			.subscribe(
				feedback => { 
					this.feedback 		= feedback;
					this.feedbackCopy = feedback; 
          this.visibility   = 'shown';
          this.loaderVisibility = 'hidden';
				},
				errmsg => this.errMsg = <any>errmsg
			);
  }

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname 	: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)] ],
      lastname 		: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)] ],
      telnum 			: [0, [Validators.required, Validators.pattern] ],
      email 			: ['', [Validators.required, Validators.email] ],
      agree				: false,
      contacttype	: 'None',
      message			: ''
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); //(re)set form validation messages
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.feedback = this.feedbackForm.value;
    this.visibility   = 'hidden';
    this.loaderVisibility = 'shown'

    this.fbService.submitFeedback(this.feedback)
      .subscribe(
        feedback => {
          this.feedback 		    = feedback;
          this.feedbackCopy     = feedback;
          this.loaderVisibility = 'hidden'
          this.formVisibility   = 'shown';
          setTimeout(() => {
            this.formVisibility = 'hidden';
            this.visibility     = 'shown';
          }, 5000);
        },
        errMsg => {
          this.feedback 		= null;
          this.feedbackCopy = null;
          this.errMsg 	    = <any>errMsg;
        }
      );
    this.feedbackForm.reset({
      firstname		: '',
      lastname		: '',
      telnum			: 0,
      email				: '',
      agree				: false,
      contactType	: 'None',
      message			: ''
    });
    this.feedbackFormDirective.resetForm();
  }
}
