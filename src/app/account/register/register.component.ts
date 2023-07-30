﻿import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import {GKeybLanGlobal as G} from '@app/_globals'

import { AccountService, AlertService } from '@app/_services';
import { LangValidator } from '@app/_helpers/lang.validators';
import { EFSM, IEFM, TLangNames } from '@app/_interfaces/interfaces';
import { IUserDetailsFieldsData, USER_DATA_MULTI } from './register.data';
import { ILANG_DESCR } from '@app/keyboard/keyb-data/keyb.data';
import { Subscription } from 'rxjs';
import { UserModel } from '@app/_models';
@Component({ 
  selector: 'and-register',
 
  templateUrl: 'register.component.html',
  styleUrls: ['register.component.scss']

 })
export class RegisterComponent implements OnInit ,OnDestroy,
IEFM<UserModel>{
    form!: FormGroup;
    loading = false;
    submitted = false;
    //flags = this.accountSvc.flags;


    constructor(
        // private route: ActivatedRoute,
        // private router: Router,
        private accountSvc: AccountService,
        private alertSvc: AlertService
    ) { }
 
  toEnter(): boolean {
   // this.accountSvc.clearFlags();
     // this.flags.fHome = true;//=1;
    // this.flags.fLogout = false;//=2;
    //  this.flags.fLogin = true;//=4;
    //  this.flags.fRegistr = false;//=8;
    //  this.flags.fVisa = false;//=16;
    // this.flags.fPay = false;//=32;
    //  this.flags.fAdmin = false;// = 128
    return true;
  }
  get state(): EFSM {
   return EFSM.eRegistrate;
  }
  toExit(): boolean {
    throw new Error('Method not implemented.');
  }
  model?: UserModel | undefined;
  get itsOK(): boolean {
    throw new Error('Method not implemented.');
  }
  

    public set Lang(v:TLangNames) {
      if(this.first || v != this._Lang){
        this.first = false;
        this._Lang = v;
        this._onLangChange(v);
      }
    }
  
    private _Lang : TLangNames = 'en';
    public get () : TLangNames {
      return this._Lang;
    }
    private subs:Subscription[] = [];
    flds !: IUserDetailsFieldsData;
  
    private first:boolean = true;
    ngOnDestroy(): void {
      this.subs.forEach(s=>s.unsubscribe());
    }

    ngOnInit() {
       G.KeyboardVisible = true;
        this.subs.push(G.Lang$.subscribe(lang=>this.Lang = lang));
        this._createRegisterForm();

    }
    

    private _createRegisterForm() {
      this.form =  new FormGroup({
        firstName: new FormControl<string>('', [
          LangValidator.required("firstName")
        ]),
        lastName: new FormControl<string>('', [
          LangValidator.required("lastName")
        ]),
        userName: new FormControl<string>('', [
          LangValidator.required("userName")
        ]),

        passport: new FormControl('', [
              LangValidator.required("passport"),
              LangValidator.number("passport",9,9)
            ]),
        email: new FormControl('', [
            LangValidator.required("email"),
            LangValidator.email("email")
           ]),
        phone:  new FormControl('', [
            LangValidator.required("phone"),
            LangValidator.number("phone",7,12)
          ]),
          address:  new FormControl<string>('', [
            LangValidator.required("address")
          ]),
          ravkav:  new FormControl<string>('', [
           // LangValidator.required("address")
          ]),

      //  ravkav: new FormControl('',[]),
        imagreeTerms: new FormControl<boolean>(false,[
          LangValidator.requiredTrue("imagreeTerms")
        ]),
        imagreePolicy: new FormControl<boolean>(false,[
          LangValidator.requiredTrue("imagreePolicy")
        ]),
      });
     
           
    }
  
  
    OnSliderChange(evt:any,ctrlName:string){ //'imagreePolicy'

      const c = this.f[ctrlName] as FormControl;
      c.markAsTouched({onlySelf:true});
      const checked = !!evt?.target?.checked;
      if(c.value != checked){
        c.setValue(checked);
      }
      console.log(`OnSliderChange:(${ctrlName})=${c.value}`)
      //console.log(c.name,c.touched);
     
    }
    private _onLangChange(v : TLangNames){
      //this change language for validation strings
     // LangValidator.Lang = v;
      /// To event !!!
      this.flds = USER_DATA_MULTI[this._Lang] as IUserDetailsFieldsData;//{...USER_DATA_MULTI[this._Lang]};
      console.log(`Set Lang ${v}:${ILANG_DESCR[v].name}`);
      this._validateMe();
  
    }
    private _validateMe() {
      this.form.markAllAsTouched();

      for (let controlName in this.form?.controls) {
        const c = this.f[controlName] as FormControl;
        if(c){
          c.markAsTouched();
          c.updateValueAndValidity();
        }
      
      }
    }

  
    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }
  // c(ctrlName:string) { return this.f[ctrlName] as FormControl; }

  getClasses(cname:string) {
    const fc = this.f[cname] as FormControl;

    const c =  {

      'is-invalid': !!fc?.touched && !!fc?.errors, 
      'is-valid': !!fc?.valid ,
      // 'is-active': cname === this.active
    }
    return c;
  }  

  async onSubmit() {
    this.submitted = true;
    

    // reset alerts on submit
    this.alertSvc.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
        this._validateMe();
        return;
    }

    try {
      this.loading = true;
      const model:UserModel =  {...this.form.value};
      this.model = model;
      const user = await this.accountSvc.register$(model);
      this.loading = false;
      // this.accountSvc.flags.fVisa = true;
      this.alertSvc.success('Registration successful', 
        { keepAfterRouteChange: true });
      this.accountSvc.gotoCreditCard(user);
        // this.router.navigate(['../credit-card'], { relativeTo: this.route });

      
    } catch (error) {
      this.alertSvc.error('' + error);
        this.loading = false;
    }
    G.KeyboardVisible = false;

  

      
  }

  
}


  // getClasses(cname:string) {
    //   const fc = this.f[cname];
  
    //   const ret =  {
  
    //     'is-invalid': !!fc?.touched && !!fc?.errors, 
    //     'is-valid': !!fc?.valid ,
    //    // 'is-active': cname === this.active
    //   }
    //   return ret;
    // }  
    // getClasses2(cname:string) {
    //   const fc = this.f[cname];
  
    //   return {
  
    //     'is-invalid': !!fc?.touched && !!fc?.errors, 
    //     'is-valid': !!fc?.valid 
    //   }
    // }