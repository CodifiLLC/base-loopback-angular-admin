/* tslint:disable */
import { Injectable } from '@angular/core';
import { Email } from '../../models/Email';
import { RoleMapping } from '../../models/RoleMapping';
import { Role } from '../../models/Role';
import { CustomUser } from '../../models/CustomUser';

@Injectable()
export class SDKModels {

  private models: { [name: string]: any } = {
    Email: Email,
    RoleMapping: RoleMapping,
    Role: Role,
    CustomUser: CustomUser,
    
  };

  public get(modelName: string): any {
    return this.models[modelName];
  }
}
