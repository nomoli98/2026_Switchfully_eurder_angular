export interface UserListingRes {
  firstname: string;
  id: string;
  lastname: string;
}

export interface UserRes {
  address: {
    country: string;
    houseNumber: string;
    postalCode: string;
    streetName: string;
  };
  email: { complete: string; domain: string; localPart: string };
  firstname: string;
  id: string;
  lastname: string;
  phoneNumber: { countryCallingCode: string; number: string };
}
