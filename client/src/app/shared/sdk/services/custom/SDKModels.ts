/* tslint:disable */
import { Injectable } from '@angular/core';
import { Email } from '../../models/Email';
import { RoleMapping } from '../../models/RoleMapping';
import { Role } from '../../models/Role';
import { CustomUser } from '../../models/CustomUser';

export interface Models { [name: string]: any }

@Injectable()
export class SDKModels {

  private models: Models = {
    Email: Email,
    RoleMapping: RoleMapping,
    Role: Role,
    CustomUser: CustomUser,
    
  };

  public get(modelName: string): any {
    return this.models[modelName];
  }

  public getAll(): Models {
    return this.models;
  }

  public getModelNames(): string[] {
    return Object.keys(this.models);
  }
}
