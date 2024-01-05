import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import dotenv from './dotenv';
dotenv.config();

export const EmailRegExp =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const PhoneRegExp = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

export function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function isValidEmail(email: string) {
  return EmailRegExp.test(email);
}

export function isValidPhone(phone: string) { 
  return PhoneRegExp.test(phone);
}

export const isObject = (arg?: any) => {
  return arg && JSON.parse(JSON.stringify(arg)).constructor === Object;
};

export function extractToken(authorization: string) {
  const bearerHeader = authorization.split(' ');
  if (bearerHeader.length === 2 && bearerHeader[0] === 'Bearer') {
    return bearerHeader[1];
  }
  return '';
}
