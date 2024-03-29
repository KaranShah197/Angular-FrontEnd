import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
	selector		: 'app-dishdetail',
	templateUrl	: './dishdetail.component.html',
	styleUrls		: ['./dishdetail.component.scss'],
	host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [visibility(), flyInOut(), expand()]
})

export class DishdetailComponent implements OnInit {

	dish		: Dish;
	errMsg	: string;
	dishIds	: string[];
	prev		: string;
	next		: string;
	dishCopy: Dish;
	visibility = 'shown';

	commentForm	: FormGroup;
	comment			: Comment;
	@ViewChild('cform') commentFormDirective;

	formErrors = {
		'author'	: '',
		'rating'	:	'',
		'comment'	: ''		
	};

	validationMessages = {
		'author'	: {
			'required'	: 'Author name is required.',
			'minlength'	: 'Author name must be atleast 2 characters long.',
			'maxlength'	: 'Author name can not be more than 30 characters.'
		},
		'rating'	: {
			'required'	: 'Rating is required.'
		},
		'comment' : {
			'required'	: 'Comment must be 10 characters long.',
			'minlength'	: 'Comment must be atleast 10 characters long.',
		}
	};

	constructor(private dishService: DishService,
		private route: ActivatedRoute,
		private location: Location,
		private fb: FormBuilder,
		@Inject('BaseURL') private BaseURL) { 
			this.createForm();
		}

	ngOnInit() {
		//const id = this.route.params['id'];
		this.dishService.getDishIds()
			.subscribe((dishIds) => this.dishIds = dishIds);
		this.route.params
			.pipe(switchMap((params: Params) => {
				this.visibility = 'hidden'; 
				return this.dishService.getDish(params['id'])} ))
			.subscribe(
				dish => { 
					this.dish 		= dish;
					this.dishCopy = dish; 
					this.setPrevNext(dish.id);
					this.visibility = 'shown';
				},
				errmsg => this.errMsg = <any>errmsg
			);
	}

	setPrevNext(dishId: string) {
		const index = this.dishIds.indexOf(dishId);
		this.prev 	= this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
		this.next 	= this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
	}

	goBack(): void {
		this.location.back();
	}

	createForm() {
		this.commentForm = this.fb.group({
			author	: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)] ],
			rating	: ['5', [Validators.required] ],
			comment	: ['', [Validators.required, Validators.minLength(10)] ],
		});

		this.commentForm.valueChanges
			.subscribe(data => this.onValueChanged(data));

		this.onValueChanged(); //(re)set form validation messages
	}

	onValueChanged(data?: any) {
		if (!this.commentForm) { return; }
		const form = this.commentForm;
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
		this.comment 			= this.commentForm.value;
		this.comment.date = new Date().toISOString();
		//this.dish.comments.push(this.comment);
		this.dishCopy.comments.push(this.comment);
		this.dishService.putDish(this.dishCopy)
			.subscribe(
				dish => {
					this.dish 		= dish;
					this.dishCopy = dish;
				},
				errMsg => {
					this.dish 		= null;
					this.dishCopy = null;
					this.errMsg 	= <any>errMsg;
				}
			);
		//this.commentFormDirective.resetForm();
		this.commentForm.reset({
			author	: '',
			rating	: '5',
			comment	: ''
		});
	}
}