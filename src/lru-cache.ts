import * as cache from 'lru-cache';
import * as _ from 'lodash';
import { UserShipperInterface } from './interfaces';
import { Shipper } from './shippers/shipper';
import { Shippers } from './shippers/shippers';
import { ApiError } from './api-error';

export class UserShipperCache {

	private lru = new cache;

	constructor() { }

	public set = (userShipper: UserShipperInterface) => new Promise((resolve, reject) => {

		if (Shippers.hasOwnProperty(userShipper.shipper)) {
			Shippers[userShipper.shipper].getCredentials(userShipper.registrationToken)
				.then(credentials => {
					this.lru.set(userShipper, new Shippers[userShipper.shipper](credentials));
					resolve();
				})
		}
		else {
			reject (new ApiError ('Unknown Shipper', 400));
		}
	})

	public get = (userShipper: UserShipperInterface) => new Promise((resolve, reject) => {
		const shipper = this.lru.get(userShipper);
		if (_.isUndefined(shipper)) {
			reject(new ApiError('Cache entry unavailable'));
		} else {
			resolve(shipper);
		}
	});

	public has = (userShipper: UserShipperInterface) => this.lru.has(userShipper);
}