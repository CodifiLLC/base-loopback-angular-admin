/* tslint:disable */
import {
  Role
} from '../index';

declare var Object: any;
export interface CustomUserInterface {
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  realm?: string;
  username?: string;
  password: string;
  email: string;
  emailVerified?: boolean;
  verificationToken?: string;
  id?: number;
  accessTokens?: Array<any>;
  roles?: Array<Role>;
}

export class CustomUser implements CustomUserInterface {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  realm: string;
  username: string;
  password: string;
  email: string;
  emailVerified: boolean;
  verificationToken: string;
  id: number;
  accessTokens: Array<any>;
  roles: Array<Role>;
  constructor(data?: CustomUserInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `CustomUser`.
   */
  public static getModelName() {
    return "CustomUser";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of CustomUser for dynamic purposes.
  **/
  public static factory(data: CustomUserInterface): CustomUser{
    return new CustomUser(data);
  }  
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'CustomUser',
      plural: 'CustomUsers',
      properties: {
        firstName: {
          name: 'firstName',
          type: 'string'
        },
        lastName: {
          name: 'lastName',
          type: 'string'
        },
        address: {
          name: 'address',
          type: 'string'
        },
        city: {
          name: 'city',
          type: 'string'
        },
        state: {
          name: 'state',
          type: 'string'
        },
        postalCode: {
          name: 'postalCode',
          type: 'string'
        },
        realm: {
          name: 'realm',
          type: 'string'
        },
        username: {
          name: 'username',
          type: 'string'
        },
        password: {
          name: 'password',
          type: 'string'
        },
        email: {
          name: 'email',
          type: 'string'
        },
        emailVerified: {
          name: 'emailVerified',
          type: 'boolean'
        },
        verificationToken: {
          name: 'verificationToken',
          type: 'string'
        },
        id: {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
        accessTokens: {
          name: 'accessTokens',
          type: 'Array<any>',
          model: ''
        },
        roles: {
          name: 'roles',
          type: 'Array<Role>',
          model: 'Role'
        },
      }
    }
  }
}
