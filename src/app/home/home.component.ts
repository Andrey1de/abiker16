﻿import { Component } from '@angular/core';

import { UserModel } from '@app/_models';
import { AccountService } from '@app/_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
    user: UserModel | null;

    constructor(private accountService: AccountService) {
        this.user = this.accountService.userValue;
    }
}