export type CompanyApiKeyDTO = {
  id: string;
  name: string;
  secretPrefix: string;
  secretLast4: string;
  createdAt: Date;
};

export type CreatedCompanyApiKeyDTO = CompanyApiKeyDTO & {
  secret: string;
};
